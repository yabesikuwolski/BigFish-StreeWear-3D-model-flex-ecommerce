export const categories = {
  caps: { label: 'Caps', slug: 'caps' },
  hats: { label: 'Cowboy Hats', slug: 'cowboy-hats' },
  tops: { label: 'Crop Tops', slug: 'crop-tops' },
  tshirts: { label: 'T-Shirts', slug: 't-shirts' },
  hoodies: { label: 'Hoodies', slug: 'hoodies' },
}

export const products = [
  { id: 'cap1', name: 'Olive Field Cap', category: 'caps', code: '01 / CAP', price: 25000, model: '/products/cap1.glb' },
  { id: 'cap2', name: 'Cloudline Cap', category: 'caps', code: '02 / CAP', price: 25000, model: '/products/cap2.glb' },
  { id: 'cap3', name: 'Black Mark Cap', category: 'caps', code: '03 / CAP', price: 25000, model: '/products/cap3.glb' },
  { id: 'cap4', name: 'Trail Badge Cap', category: 'caps', code: '04 / CAP', price: 25000, model: '/products/cap4.glb' },
  { id: 'cap5', name: 'Bubblegum Cap', category: 'caps', code: '05 / CAP', price: 25000, model: '/products/cap5.glb' },
  { id: 'cowboy_hat1', name: 'Dark Mesa Cowboy Hat', category: 'hats', code: '01 / HAT', price: 30000, model: '/products/cowboy_hat1.glb' },
  { id: 'cowboy_hat2', name: 'Saddle Tan Cowboy Hat', category: 'hats', code: '02 / HAT', price: 30000, model: '/products/cowboy_hat2.glb' },
  { id: 'crop_top1', name: 'Pink Script Crop Top', category: 'tops', code: '01 / TOP', price: 20000, model: '/products/crop_top1.glb' },
  { id: 'croptop2', name: 'Slate Wide-Neck Crop Top', category: 'tops', code: '02 / TOP', price: 20000, model: '/products/croptop2.glb' },
  { id: 'croptop3', name: 'White Strap Crop Top', category: 'tops', code: '03 / TOP', price: 20000, model: '/products/croptop3.glb' },
  { id: 'croptop4', name: 'Grey Draped Crop Top', category: 'tops', code: '04 / TOP', price: 20000, model: '/products/croptop4.glb' },
  { id: 'croptop5', name: 'White Lace-Up Crop Top', category: 'tops', code: '05 / TOP', price: 20000, model: '/products/croptop5.glb' },
  { id: 'bigfishtshirt', name: 'Core White T-Shirt', category: 'tshirts', code: '01 / TEE', price: null, model: '/products/bigfishtshirt.glb' },
  { id: 'hood1', name: 'Ink Black Hoodie', category: 'hoodies', code: '01 / HOODIES', price: null, model: '/products/hood1.glb' },
].map((product) => ({
  ...product,
  type: categories[product.category].label,
}))

export const money = (price) => price == null ? 'Price on request' : `TSh ${price.toLocaleString('en-US')}`
export const categoryPath = (key) => `/shop/${categories[key].slug}`
export const pathForProduct = (product) => `/product/${product.id}`
