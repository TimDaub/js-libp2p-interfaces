import { expect } from 'aegir/utils/chai.js'
import crypto from 'libp2p-crypto'
import { CID } from 'multiformats/cid'
import Digest from 'multiformats/hashes/digest'
import { base16 } from 'multiformats/bases/base16'
import { base36 } from 'multiformats/bases/base36'
import { base58btc } from 'multiformats/bases/base58'
import { identity } from 'multiformats/hashes/identity'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import type { TestSetup } from '../index.js'
import type { PeerIdFactory } from 'libp2p-interfaces/peer-id'

const DAG_PB_CODE = 0x70
const LIBP2P_KEY_CODE = 0x72
const RAW_CODE = 0x55

const testOpts = {
  bits: 512
}

const goId = {
  id: 'QmRLoXS3E73psYaUsma1VSbboTa2J8Z9kso1tpiGLk9WQ4',
  privKey: 'CAASpwkwggSjAgEAAoIBAQDWBEbO8kc6a5kEks09CKPQargY3p0DCmCczoCT52/RYFqxvH9dI+s+u4ZAvF9aLWOBvFomL7jHZODPxKDrbiNCmyEbViNgZYK+PNbwh0V3ZGbB27X3q8yZtLvYA8dhcNkz/2SHBarSoC4QLA5MXUuSWtVaYMY3MzMnzBF57Jc9Ase7NvHOIUI90M7aN5izP7hxPXpZ+shiN+TyjM8mFxYONG7ZSsY3IxUhtrU5MRzFX+tp1o/gb/aa51mHf7AL3N02j5ABiYbCK97Rbwr03hsBcwgMxoDPJmP3WZ+D5yyPcOIIF1Vd7+4/f7FQJnIw3xr9/jvaFbPyDCVbBOhr9oyxAgMBAAECggEALlrgx2Q8v0+c5hux7p1XdgYXd/OHyKfPw0cLHH4NfylCm6q7X34vLvhJHO5wLMUV/3y/ffPqLu4Pr5DkVfoWExAsvJIMuY1jIzdkStbR2glaJHUlVc7VUxmNcj1nSxi5QwT3TjORC2v8bi5Mroeqnbmk6p15cW1akC0oP+NZ4rG48+WFHRqsBaBusdSOVfA+IiZUqSd1ILysJ1w7aVN3EC7jLjDG43i+P/2BcEHy8TVClGOknJL341bHe3UPdEpmeu6k6aHGlDI4blUMXahCIUh0IdZuj+Vi/TxQME9+3bKIOjQb8RCNm3U3j/uz5gs9SyTjBuYIib9Scj/jDbLh0QKBgQDfLr3go3Q/AR0jb12QjGALJz1lc9ZRX2RQJkqqmYkZwOlHHyl+YJgqOZiO80fUkN0sJ29CmKecXU4gXuHir913Fdceei1ScBSsvZpWtBLhEZXKrRJYq8U0atKUFQADDMGutyB/uGCNeNwR6VcJezHPICvHxQfmWlWHA5VIOEtRPQKBgQD1fID76SkIpF/EaJMnN2alXWWnzKhUBUPGpQtbpwgSfaCBiZ4vr3NQwKBntOOB5QwHmifNZMoqaFQLzC4B/uyTNUcQMQQ6arYav7WQXqXTmW6poTsjUSuSOPx1swsHlYX09SmUwWDfd94XF9UOU0KUfA2/c85ixzNlV5ejkFA4hQKBgEvP3uQN4hD82d8Nl2TgqkdfnvV1cdnWY4buWvK0kOPUqelk5n1tZoMBaZc1gLLuOpMjGiIvJNByyXUpheWxA7POEXLi4b5dIEjFZ0YIiVk21gEw5UiFoMl7d+ihcY2Xqbslrb507SdhZLAY6V3pITRQo06K2XIgQWlJiE4uATepAoGBALZ2vEiBnYZW5vfN4tKbUyhGq3B1pggNgbr8odyV4mIcDlk6OOGov0WeZ5ut0AyUesSLyFnaOIoc0ZuTP/8rxBwG1bMrO8FP39sx83pDX25P9PkQZixyALjGsp+pXOFeOhtAvo9azO5M4j638Bydtjc3neBX62dwOLtyx7tDYN0hAoGAVLmr3w7XMVHTfEuCSzKHyRrOaN2PAuSX31QAji1PwlwVKMylVrb8rRvBOpTicA/wXPX9Q5O/yjegqhqLT/LXAm9ziFzy5b9/9SzXPukKebXXbvc0FOmcsrcxtijlPyUzf9fKM1ShiwqqsgM9eNyZ9GWUJw2GFATCWW7pl7rtnWk='
}

const testId = {
  id: '122019318b6e5e0cf93a2314bf01269a2cc23cd3dcd452d742cdb9379d8646f6e4a9',
  privKey: 'CAASpgkwggSiAgEAAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAECggEAZtju/bcKvKFPz0mkHiaJcpycy9STKphorpCT83srBVQi59CdFU6Mj+aL/xt0kCPMVigJw8P3/YCEJ9J+rS8BsoWE+xWUEsJvtXoT7vzPHaAtM3ci1HZd302Mz1+GgS8Epdx+7F5p80XAFLDUnELzOzKftvWGZmWfSeDnslwVONkL/1VAzwKy7Ce6hk4SxRE7l2NE2OklSHOzCGU1f78ZzVYKSnS5Ag9YrGjOAmTOXDbKNKN/qIorAQ1bovzGoCwx3iGIatQKFOxyVCyO1PsJYT7JO+kZbhBWRRE+L7l+ppPER9bdLFxs1t5CrKc078h+wuUr05S1P1JjXk68pk3+kQKBgQDeK8AR11373Mzib6uzpjGzgNRMzdYNuExWjxyxAzz53NAR7zrPHvXvfIqjDScLJ4NcRO2TddhXAfZoOPVH5k4PJHKLBPKuXZpWlookCAyENY7+Pd55S8r+a+MusrMagYNljb5WbVTgN8cgdpim9lbbIFlpN6SZaVjLQL3J8TWH6wKBgQDSChzItkqWX11CNstJ9zJyUE20I7LrpyBJNgG1gtvz3ZMUQCn3PxxHtQzN9n1P0mSSYs+jBKPuoSyYLt1wwe10/lpgL4rkKWU3/m1Myt0tveJ9WcqHh6tzcAbb/fXpUFT/o4SWDimWkPkuCb+8j//2yiXk0a/T2f36zKMuZvujqQKBgC6B7BAQDG2H2B/ijofp12ejJU36nL98gAZyqOfpLJ+FeMz4TlBDQ+phIMhnHXA5UkdDapQ+zA3SrFk+6yGk9Vw4Hf46B+82SvOrSbmnMa+PYqKYIvUzR4gg34rL/7AhwnbEyD5hXq4dHwMNsIDq+l2elPjwm/U9V0gdAl2+r50HAoGALtsKqMvhv8HucAMBPrLikhXP/8um8mMKFMrzfqZ+otxfHzlhI0L08Bo3jQrb0Z7ByNY6M8epOmbCKADsbWcVre/AAY0ZkuSZK/CaOXNX/AhMKmKJh8qAOPRY02LIJRBCpfS4czEdnfUhYV/TYiFNnKRj57PPYZdTzUsxa/yVTmECgYBr7slQEjb5Onn5mZnGDh+72BxLNdgwBkhO0OCdpdISqk0F0Pxby22DFOKXZEpiyI9XYP1C8wPiJsShGm2yEwBPWXnrrZNWczaVuCbXHrZkWQogBDG3HGXNdU4MAWCyiYlyinIBpPpoAJZSzpGLmWbMWh28+RJS6AQX6KHrK1o2uw==',
  pubKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',
  marshaled: '0a22122019318b6e5e0cf93a2314bf01269a2cc23cd3dcd452d742cdb9379d8646f6e4a912ab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100b648aa3f1cc1597819a5d401775e28f3af1adf417749ce378f05901b771a8a47531cea3b911d78a3e875d83e3940934d41845d52dcb9782f08b47001e18207f8e7bb0c839e545b278629e52fd2e720bc2a41c25479710d36d22d0c8338cf58e2d6ab5aedbd26cd7008b6644567ebe43611c1e8df052f591b4b78acfe0d94997f0d8f1030be0c63c93e5edff20ef3979e98ca69a6cc7f658992cdaf383faa2768914bf9bb5a5d1ab7292ee3cd79338393472a281f8e51bb8a8fd1928581020848dac9b24397ddbbea86a52fd82106d49e12fdb492e81ab53bd8cb9f74c05949924bf297e9cfc481f410460c28af5745696ef57627a127dba22c1cbfc3374a5b2302030100011aab09080012a609308204a20201000282010100b648aa3f1cc1597819a5d401775e28f3af1adf417749ce378f05901b771a8a47531cea3b911d78a3e875d83e3940934d41845d52dcb9782f08b47001e18207f8e7bb0c839e545b278629e52fd2e720bc2a41c25479710d36d22d0c8338cf58e2d6ab5aedbd26cd7008b6644567ebe43611c1e8df052f591b4b78acfe0d94997f0d8f1030be0c63c93e5edff20ef3979e98ca69a6cc7f658992cdaf383faa2768914bf9bb5a5d1ab7292ee3cd79338393472a281f8e51bb8a8fd1928581020848dac9b24397ddbbea86a52fd82106d49e12fdb492e81ab53bd8cb9f74c05949924bf297e9cfc481f410460c28af5745696ef57627a127dba22c1cbfc3374a5b2302030100010282010066d8eefdb70abca14fcf49a41e2689729c9ccbd4932a9868ae9093f37b2b055422e7d09d154e8c8fe68bff1b749023cc562809c3c3f7fd808427d27ead2f01b28584fb159412c26fb57a13eefccf1da02d337722d4765ddf4d8ccf5f86812f04a5dc7eec5e69f345c014b0d49c42f33b329fb6f58666659f49e0e7b25c1538d90bff5540cf02b2ec27ba864e12c5113b976344d8e9254873b30865357fbf19cd560a4a74b9020f58ac68ce0264ce5c36ca34a37fa88a2b010d5ba2fcc6a02c31de21886ad40a14ec72542c8ed4fb09613ec93be9196e105645113e2fb97ea693c447d6dd2c5c6cd6de42aca734efc87ec2e52bd394b53f52635e4ebca64dfe9102818100de2bc011d75dfbdccce26fabb3a631b380d44ccdd60db84c568f1cb1033cf9dcd011ef3acf1ef5ef7c8aa30d270b27835c44ed9375d85701f66838f547e64e0f24728b04f2ae5d9a56968a24080c84358efe3dde794bcafe6be32eb2b31a8183658dbe566d54e037c7207698a6f656db20596937a4996958cb40bdc9f13587eb02818100d20a1cc8b64a965f5d4236cb49f73272504db423b2eba720493601b582dbf3dd93144029f73f1c47b50ccdf67d4fd2649262cfa304a3eea12c982edd70c1ed74fe5a602f8ae4296537fe6d4ccadd2dbde27d59ca8787ab737006dbfdf5e95054ffa384960e299690f92e09bfbc8ffff6ca25e4d1afd3d9fdfacca32e66fba3a90281802e81ec10100c6d87d81fe28e87e9d767a3254dfa9cbf7c800672a8e7e92c9f8578ccf84e504343ea6120c8671d70395247436a943ecc0dd2ac593eeb21a4f55c381dfe3a07ef364af3ab49b9a731af8f62a29822f533478820df8acbffb021c276c4c83e615eae1d1f030db080eafa5d9e94f8f09bf53d57481d025dbeaf9d070281802edb0aa8cbe1bfc1ee7003013eb2e29215cfffcba6f2630a14caf37ea67ea2dc5f1f39612342f4f01a378d0adbd19ec1c8d63a33c7a93a66c22800ec6d6715adefc0018d1992e4992bf09a397357fc084c2a628987ca8038f458d362c8251042a5f4b873311d9df521615fd362214d9ca463e7b3cf619753cd4b316bfc954e610281806beec9501236f93a79f99999c60e1fbbd81c4b35d83006484ed0e09da5d212aa4d05d0fc5bcb6d8314e297644a62c88f5760fd42f303e226c4a11a6db213004f5979ebad9356733695b826d71eb664590a200431b71c65cd754e0c0160b28989728a7201a4fa68009652ce918b9966cc5a1dbcf91252e80417e8a1eb2b5a36bb'
}

const testIdHex = testId.id
const testIdBytes = base16.decode(`f${testId.id}`)
const testIdDigest = Digest.decode(testIdBytes)
const testIdB58String = base58btc.encode(testIdBytes).substring(1)
const testIdB36String = base36.encode(testIdBytes)
const testIdCID = CID.createV1(LIBP2P_KEY_CODE, testIdDigest)
const testIdCIDString = testIdCID.toString()

export default (common: TestSetup<PeerIdFactory>) => {
  describe('interface-peer-id compliance tests', () => {
    let factory: PeerIdFactory

    beforeEach(async () => {
      factory = await common.setup()
    })

    afterEach(async () => {
      await common.teardown()
    })

    it('create a new id', async () => {
      const id = await factory.create(testOpts)
      expect(id.toB58String().length).to.equal(46)
    })

    it('can be created for a Secp256k1 key', async () => {
      const id = await factory.create({ keyType: 'secp256k1', bits: 256 })
      const expB58 = base58btc.encode((await identity.digest(id.pubKey.bytes)).bytes).slice(1)
      expect(id.toB58String()).to.equal(expB58)
    })

    it('can get the public key from a Secp256k1 key', async () => {
      const original = await factory.create({ keyType: 'secp256k1', bits: 256 })
      const newId = factory.createFromB58String(original.toB58String())
      expect(original.pubKey.bytes).to.eql(newId.pubKey.bytes)
    })

    it('isPeerId', async () => {
      const id = await factory.create(testOpts)
      expect(factory.isPeerId(id)).to.equal(true)
      expect(factory.isPeerId('aaa')).to.equal(false)
      expect(factory.isPeerId(uint8ArrayFromString('batatas'))).to.equal(false)
    })

    it('throws on changing the id', async () => {
      const id = await factory.create(testOpts)
      expect(id.toB58String().length).to.equal(46)
      expect(() => {
        // @ts-expect-error
        id.id = uint8ArrayFromString('hello')
      }).to.throw(/immutable/)
    })

    it('recreate from Hex string', () => {
      const id = factory.createFromHexString(testIdHex)
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from a Uint8Array', () => {
      const id = factory.createFromBytes(testIdBytes)
      expect(testId.id).to.equal(id.toHexString())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from a B58 String', () => {
      const id = factory.createFromB58String(testIdB58String)
      expect(testIdB58String).to.equal(id.toB58String())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from CID object', () => {
      const id = factory.createFromCID(testIdCID)
      expect(testIdCIDString).to.equal(id.toString())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from Base58 String (CIDv0)', () => {
      const id = factory.createFromCID(CID.parse(testIdB58String))
      expect(testIdCIDString).to.equal(id.toString())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from Base36 String', () => {
      const id = factory.parse(testIdB36String)
      expect(testIdCIDString).to.equal(id.toString())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from CIDv1 Base32 (libp2p-key multicodec)', () => {
      const cid = CID.createV1(LIBP2P_KEY_CODE, testIdDigest)
      const id = factory.createFromCID(cid)
      expect(cid.toString()).to.equal(id.toString())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from CIDv1 Base32 (dag-pb multicodec)', () => {
      const cid = CID.createV1(DAG_PB_CODE, testIdDigest)
      const id = factory.createFromCID(cid)
      // toString should return CID with multicodec set to libp2p-key
      expect(CID.parse(id.toString()).code).to.equal(LIBP2P_KEY_CODE)
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from CID Uint8Array', () => {
      const id = factory.createFromBytes(testIdCID.bytes)
      expect(testIdCIDString).to.equal(id.toString())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('throws on invalid CID multicodec', () => {
      // only libp2p and dag-pb are supported
      const invalidCID = CID.createV1(RAW_CODE, testIdDigest)
      expect(() => {
        factory.createFromCID(invalidCID)
      }).to.throw(/invalid/i)
    })

    it('throws on invalid multihash value', () => {
      // using function code 0x50 that does not represent valid hash function
      // https://github.com/multiformats/js-multihash/blob/b85999d5768bf06f1b0f16b926ef2cb6d9c14265/src/constants.js#L345
      const invalidMultihash = uint8ArrayToString(Uint8Array.from([0x50, 0x1, 0x0]), 'base58btc')
      expect(() => {
        factory.createFromB58String(invalidMultihash)
      }).to.throw(/invalid/i)
    })

    it('throws on invalid CID object', () => {
      const invalidCID = {}
      expect(() => {
        // @ts-expect-error invalid cid is invalid type
        factory.createFromCID(invalidCID)
      }).to.throw(/invalid/i)
    })

    it('recreate from a Public Key', async () => {
      const id = await factory.createFromPubKey(testId.pubKey)
      expect(testIdB58String).to.equal(id.toB58String())
      expect(testIdBytes).to.deep.equal(id.toBytes())
    })

    it('recreate from a Private Key', async () => {
      const id = await factory.createFromPrivKey(testId.privKey)
      expect(testIdB58String).to.equal(id.toB58String())
      const encoded = uint8ArrayFromString(testId.privKey, 'base64pad')
      const id2 = await factory.createFromPrivKey(encoded)
      expect(testIdB58String).to.equal(id2.toB58String())
      expect(id.marshalPubKey()).to.deep.equal(id2.marshalPubKey())
    })

    it('recreate from Protobuf', async () => {
      const id = await factory.createFromProtobuf(testId.marshaled)
      expect(testIdB58String).to.equal(id.toB58String())
      const encoded = uint8ArrayFromString(testId.privKey, 'base64pad')
      const id2 = await factory.createFromPrivKey(encoded)
      expect(testIdB58String).to.equal(id2.toB58String())
      expect(id.marshalPubKey()).to.deep.equal(id2.marshalPubKey())
      expect(uint8ArrayToString(id.marshal(), 'base16')).to.deep.equal(testId.marshaled)
    })

    it('recreate from embedded ed25519 key', async () => {
      const key = '12D3KooWRm8J3iL796zPFi2EtGGtUJn58AG67gcqzMFHZnnsTzqD'
      const id = await factory.parse(key)
      expect(id.toB58String()).to.equal(key)
      const expB58 = base58btc.encode((await identity.digest(id.pubKey.bytes)).bytes).slice(1)
      expect(id.toB58String()).to.equal(expB58)
    })

    it('recreate from embedded secp256k1 key', async () => {
      const key = '16Uiu2HAm5qw8UyXP2RLxQUx5KvtSN8DsTKz8quRGqGNC3SYiaB8E'
      const id = await factory.parse(key)
      expect(id.toB58String()).to.equal(key)
      const expB58 = base58btc.encode((await identity.digest(id.pubKey.bytes)).bytes).slice(1)
      expect(id.toB58String()).to.equal(expB58)
    })

    it('recreate from string key', async () => {
      const key = 'QmRsooYQasV5f5r834NSpdUtmejdQcpxXkK6qsozZWEihC'
      const id = await factory.parse(key)
      expect(id.toB58String()).to.equal(key)
    })

    it('can be created from a Secp256k1 public key', async () => {
      const privKey = await crypto.keys.generateKeyPair('secp256k1', 256)
      const id = await factory.createFromPubKey(privKey.public.bytes)
      const expB58 = base58btc.encode((await identity.digest(id.pubKey.bytes)).bytes).slice(1)
      expect(id.toB58String()).to.equal(expB58)
    })

    it('can be created from a Secp256k1 private key', async () => {
      const privKey = await crypto.keys.generateKeyPair('secp256k1', 256)
      const id = await factory.createFromPrivKey(privKey.bytes)
      const expB58 = base58btc.encode((await identity.digest(id.pubKey.bytes)).bytes).slice(1)
      expect(id.toB58String()).to.equal(expB58)
    })

    it('Compare generated ID with one created from PubKey', async () => {
      const id1 = await factory.create(testOpts)
      const id2 = await factory.createFromPubKey(id1.marshalPubKey())
      expect(id1.id).to.be.eql(id2.id)
    })

    it('Works with default options', async function () {
      this.timeout(10000)
      const id = await factory.create()
      expect(id.toB58String().length).to.equal(46)
    })

    it('Non-default # of bits', async function () {
      this.timeout(1000 * 60)
      const shortId = await factory.create(testOpts)
      const longId = await factory.create({ bits: 1024 })
      expect(shortId.privKey.bytes.length).is.below(longId.privKey.bytes.length)
    })

    it('Pretty printing', async () => {
      const id1 = await factory.create(testOpts)
      const json = id1.toJSON()

      if (json.privKey == null) {
        throw new Error('No private key found in JSON output')
      }

      const id2 = await factory.createFromPrivKey(json.privKey)
      expect(id1.toPrint()).to.be.eql(id2.toPrint())
      expect(id1.toPrint()).to.equal('<peer.ID ' + id1.toB58String().substr(2, 6) + '>')
    })

    it('toBytes', () => {
      const id = factory.createFromHexString(testIdHex)
      expect(uint8ArrayToString(id.toBytes(), 'base16')).to.equal(uint8ArrayToString(testIdBytes, 'base16'))
    })

    it('equals', async () => {
      const ids = await Promise.all([
        factory.create(testOpts),
        factory.create(testOpts)
      ])

      expect(ids[0].equals(ids[0])).to.equal(true)
      expect(ids[0].equals(ids[1])).to.equal(false)
      expect(ids[0].equals(ids[0].id)).to.equal(true)
      expect(ids[0].equals(ids[1].id)).to.equal(false)
    })

    describe('hasInlinePublicKey', () => {
      it('returns true if uses a key type with inline public key', async () => {
        const peerId = await factory.create({ keyType: 'secp256k1' })
        expect(peerId.hasInlinePublicKey()).to.equal(true)
      })

      it('returns false if uses a key type with no inline public key', async () => {
        const peerId = await factory.create({ keyType: 'RSA' })
        expect(peerId.hasInlinePublicKey()).to.equal(false)
      })
    })

    describe('fromJSON', () => {
      it('full node', async () => {
        const id = await factory.create(testOpts)
        const other = await factory.createFromJSON(id.toJSON())
        expect(id.toB58String()).to.equal(other.toB58String())
        expect(id.privKey.bytes).to.eql(other.privKey.bytes)
        expect(id.pubKey.bytes).to.eql(other.pubKey.bytes)
      })

      it('only id', async () => {
        const key = await crypto.keys.generateKeyPair('RSA', 1024)
        const digest = await key.public.hash()
        const id = factory.createFromBytes(digest)
        expect(id.privKey).to.not.exist()
        expect(id.pubKey).to.not.exist()
        const other = await factory.createFromJSON(id.toJSON())
        expect(id.toB58String()).to.equal(other.toB58String())
      })

      it('go interop', async () => {
        const id = await factory.createFromJSON(goId)
        const digest = await id.privKey.public.hash()
        expect(base58btc.encode(digest).slice(1)).to.eql(goId.id)
      })
    })

    it('set privKey (valid)', async () => {
      const peerId = await factory.create(testOpts)
      // @ts-expect-error
      peerId.privKey = peerId._privKey
      expect(peerId.isValid()).to.equal(true)
    })

    it('set pubKey (valid)', async () => {
      const peerId = await factory.create(testOpts)
      // @ts-expect-error
      peerId.pubKey = peerId._pubKey
      expect(peerId.isValid()).to.equal(true)
    })

    it('set privKey (invalid)', async () => {
      const peerId = await factory.create(testOpts)
      // @ts-expect-error
      peerId.privKey = uint8ArrayFromString('bufff')
      expect(peerId.isValid()).to.equal(false)
    })

    it('set pubKey (invalid)', async () => {
      const peerId = await factory.create(testOpts)
      // @ts-expect-error
      peerId.pubKey = uint8ArrayFromString('bufff')
      expect(peerId.isValid()).to.equal(false)
    })

    it('keys are equal after one is stringified', async () => {
      const peerId = await factory.create(testOpts)
      const peerId1 = factory.createFromB58String(peerId.toB58String())
      const peerId2 = factory.createFromB58String(peerId.toB58String())

      expect(peerId1).to.deep.equal(peerId2)

      peerId1.toString()

      expect(peerId1).to.deep.equal(peerId2)
    })

    describe('throws on inconsistent data', () => {
      let k1: crypto.keys.supportedKeys.rsa.RsaPrivateKey
      let k2: crypto.keys.supportedKeys.rsa.RsaPrivateKey
      let k3: crypto.keys.supportedKeys.rsa.RsaPrivateKey

      before(async () => {
        const keys = await Promise.all([
          crypto.keys.generateKeyPair('RSA', 512),
          crypto.keys.generateKeyPair('RSA', 512),
          crypto.keys.generateKeyPair('RSA', 512)
        ])

        k1 = keys[0]
        k2 = keys[1]
        k3 = keys[2]
      })

      it('missmatch private - public key', async () => {
        const digest = await k1.public.hash()
        expect(async () => {
          return await factory.createFromJSON({
            id: uint8ArrayToString(digest, 'base58btc'),
            pubKey: uint8ArrayToString(k1.bytes, 'base64pad'),
            privKey: uint8ArrayToString(k2.bytes, 'base64pad')
          })
        }).to.throw(/inconsistent arguments/)
      })

      it('missmatch id - private - public key', async () => {
        const digest = await k1.public.hash()
        expect(async () => {
          return await factory.createFromJSON({
            id: uint8ArrayToString(digest, 'base58btc'),
            pubKey: uint8ArrayToString(k1.bytes, 'base64pad'),
            privKey: uint8ArrayToString(k3.bytes, 'base64pad')
          }) // eslint-disable-line no-new
        }).to.throw(/inconsistent arguments/)
      })

      it('invalid id', () => {
        // @ts-expect-error incorrect constructor arg type
        expect(async () => await factory.createFromJSON('hello world')).to.throw(/invalid id/)
      })
    })
  })
}
