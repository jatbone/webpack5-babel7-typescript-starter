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
