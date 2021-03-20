import './assets/styles/index.scss'

let s: string

s = 'tu som'

const getObjKey = <T, U extends keyof T>(obj: T, key: U) => {
  return obj[key] || null
}

const obj = { foo: 'goo' }

const r = getObjKey(obj, 'foo')

console.log(Object.values(obj))

console.log([1, 2].includes(1))

console.log(r)

const p = new Promise<string>((res, rej) => {
  if (res) {
    return res('ok')
  }
  return rej('no ok')
})
p.then((res) => res).catch((err) => err)

console.log(p)

const setTest = new Set([1, 2, 3, 2, 1])
console.log(setTest)
