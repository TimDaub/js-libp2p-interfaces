import debug from 'debug'
import { EventEmitter } from 'events'
import lp from 'it-length-prefixed'
import pushable from 'it-pushable'
import { pipe } from 'it-pipe'
import { source as abortable } from 'abortable-iterator'
import AbortController from 'abort-controller'
import type { PeerId } from 'libp2p-interfaces/peer-id'
import type { MuxedStream } from 'libp2p-interfaces/stream-muxer'

const log = Object.assign(debug('libp2p-pubsub:peer-streams'), {
  error: debug('libp2p-pubsub:peer-streams:err')
})

export interface Options {
  id: PeerId
  protocol: string
}

/**
 * Thin wrapper around a peer's inbound / outbound pubsub streams
 */
export class PeerStreams extends EventEmitter {
  public readonly id: PeerId
  public readonly protocol: string
  /**
   * Write stream - it's preferable to use the write method
   */
  public outboundStream: pushable.Pushable<Uint8Array> | undefined
  /**
   * Read stream
   */
  public inboundStream: AsyncIterable<Uint8Array> | undefined
  /**
   * The raw outbound stream, as retrieved from conn.newStream
   */
  private _rawOutboundStream: MuxedStream | undefined
  /**
   * The raw inbound stream, as retrieved from the callback from libp2p.handle
   */
  private _rawInboundStream: MuxedStream | undefined
  /**
   * An AbortController for controlled shutdown of the inbound stream
   */
  private readonly _inboundAbortController: AbortController

  constructor (opts: Options) {
    super()

    this.id = opts.id
    this.protocol = opts.protocol

    this._inboundAbortController = new AbortController()
  }

  /**
   * Do we have a connection to read from?
   *
   * @type {boolean}
   */
  get isReadable () {
    return Boolean(this.inboundStream)
  }

  /**
   * Do we have a connection to write on?
   *
   * @type {boolean}
   */
  get isWritable () {
    return Boolean(this.outboundStream)
  }

  /**
   * Send a message to this peer.
   * Throws if there is no `stream` to write to available.
   */
  write (data: Uint8Array) {
    if (this.outboundStream == null) {
      const id = this.id.toB58String()
      throw new Error('No writable connection to ' + id)
    }

    this.outboundStream.push(data)
  }

  /**
   * Attach a raw inbound stream and setup a read stream
   */
  attachInboundStream (stream: MuxedStream) {
    // Create and attach a new inbound stream
    // The inbound stream is:
    // - abortable, set to only return on abort, rather than throw
    // - transformed with length-prefix transform
    this._rawInboundStream = stream
    this.inboundStream = abortable(
      pipe(
        this._rawInboundStream,
        lp.decode()
      ),
      this._inboundAbortController.signal,
      { returnOnAbort: true }
    )

    this.emit('stream:inbound')
    return this.inboundStream
  }

  /**
   * Attach a raw outbound stream and setup a write stream
   */
  async attachOutboundStream (stream: MuxedStream) {
    // If an outbound stream already exists, gently close it
    const _prevStream = this.outboundStream
    if (this.outboundStream != null) {
      // End the stream without emitting a close event
      await this.outboundStream.end()
    }

    this._rawOutboundStream = stream
    this.outboundStream = pushable({
      onEnd: (shouldEmit) => {
        // close writable side of the stream
        if ((this._rawOutboundStream?.reset) != null) {
          this._rawOutboundStream.reset()
        }

        this._rawOutboundStream = undefined
        this.outboundStream = undefined
        if (shouldEmit != null) {
          this.emit('close')
        }
      }
    })

    pipe(
      this.outboundStream,
      lp.encode(),
      this._rawOutboundStream
    ).catch((err: Error) => {
      log.error(err)
    })

    // Only emit if the connection is new
    if (_prevStream == null) {
      this.emit('stream:outbound')
    }
  }

  /**
   * Closes the open connection to peer
   */
  close () {
    // End the outbound stream
    if (this.outboundStream != null) {
      this.outboundStream.end()
    }
    // End the inbound stream
    if (this.inboundStream != null) {
      this._inboundAbortController.abort()
    }

    this._rawOutboundStream = undefined
    this.outboundStream = undefined
    this._rawInboundStream = undefined
    this.inboundStream = undefined
    this.emit('close')
  }
}
