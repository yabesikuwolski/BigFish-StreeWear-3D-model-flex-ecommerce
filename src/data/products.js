export const categories = {
  caps: { label: '3D Caps', slug: 'caps' },
  hats: { label: 'Cowboy Hats', slug: 'cowboy-hats' },
  tops: { label: 'Crop Tops', slug: 'crop-tops' },
  tshirts: { label: 'T-Shirts', slug: 't-shirts' },
  hoodies: { label: 'Hoodies / Hood', slug: 'hoodies' },
}

const numbered = (assets, category, name, code, price) => assets.map((id, index) => ({
  id,
  name: `${name} ${String(index + 1).padStart(2, '0')}`,
  category,
  code: `${String(index + 1).padStart(2, '0')} / ${code}`,
  price,
  model: `/products/${id}.glb`,
}))

export const products = [
  ...numbered(['cap1', 'cap2', 'cap3', 'cap4', 'cap5'], 'caps', '3D Cap', 'CAP', 25000),
  ...numbered(['cowboy_hat1', 'cowboy_hat2'], 'hats', 'Cowboy Hat', 'HAT', 30000),
  ...numbered(['crop_top1', 'croptop2', 'croptop3', 'croptop4', 'croptop5'], 'tops', 'Crop Top', 'TOP', 20000),
  { id: 'bigfishtshirt', name: 'BIGFISH T-Shirt', category: 'tshirts', code: '01 / TEE', price: null, model: '/products/bigfishtshirt.glb' },
  { id: 'hood1', name: 'Hoodie 01', category: 'hoodies', code: '01 / HOOD', price: null, model: '/products/hood1.glb' },
].map((product) => ({
  ...product,
  type: categories[product.category].label,
}))

export const money = (price) => price == null ? 'Price on request' : `TSh ${price.toLocaleString('en-US')}`
export const categoryPath = (key) => `/shop/${categories[key].slug}`
export const pathForProduct = (product) => `/product/${product.id}`
