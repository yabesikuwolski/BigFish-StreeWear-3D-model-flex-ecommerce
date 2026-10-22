import { useEffect, useRef, useState } from 'react'
import './App.css'
import { categories, categoryPath, money, pathForProduct, products } from './data/products.js'

const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')

function whatsappUrl(message) {
  if (!whatsappNumber) return ''
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

function resolvePath(path) {
  if (path === '/') return { page: 'home' }
  if (path === '/shop') return { page: 'shop-index' }
  if (path === '/shop/all') return { page: 'shop-all' }
  const category = Object.keys(categories).find((key) => categoryPath(key) === path)
  if (category) return { page: 'category', category }
  const product = products.find((item) => pathForProduct(item) === path)
  if (product) return { page: 'product', product }
  if (path === '/about' || path === '/contact') return { page: path.slice(1) }
  return { page: 'not-found' }
}

function App() {
  const [route, setRoute] = useState(() => resolvePath(window.location.pathname))
  const [customer, setCustomer] = useState({ name: '', location: '' })
  const [whatsappFeedback, setWhatsappFeedback] = useState('')

  useEffect(() => {
    const handlePopState = () => {
      setRoute(resolvePath(window.location.pathname))
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setRoute(resolvePath(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const order = (product, details) => {
    const fields = [
      `Product: ${product.name} (${product.type})`,
      product.price == null ? null : `Price: ${money(product.price)}`,
      details.name && `Name: ${details.name}`,
      details.location && `Location: ${details.location}`,
    ].filter(Boolean)
    const message = `Hello BIGFISH, I would like to enquire about:\n\n${fields.join('\n')}`
    const url = whatsappUrl(message)
    if (!url) {
      setWhatsappFeedback('WhatsApp enquiries are not configured yet. Please email us from the Contact page.')
      return
    }
    const popup = window.open('about:blank', '_blank')
    if (popup) {
      popup.opener = null
      popup.location = url
      setWhatsappFeedback('WhatsApp opened with your product enquiry. Review the message and send it there; this has not placed an order.')
    }
    else setWhatsappFeedback('Your browser blocked the WhatsApp window. Allow pop-ups and try again.')
  }

  return <div className="site-shell">
    <div className="delivery-bar">NATIONWIDE DELIVERY IN TANZANIA AVAILABLE</div>
    <header className="site-header">
      <button className="wordmark" onClick={() => navigate('/')} aria-label="BIGFISH home">BIGFISH<span>®</span></button>
      <nav aria-label="Main navigation">
        <button className={['shop-index', 'shop-all', 'category', 'product'].includes(route.page) ? 'active' : ''} onClick={() => navigate('/shop')}>Shop</button>
        <button className={route.page === 'about' ? 'active' : ''} onClick={() => navigate('/about')}>About</button>
        <button className={route.page === 'contact' ? 'active' : ''} onClick={() => navigate('/contact')}>Contact</button>
      </nav>
      <button className="header-order" onClick={() => navigate('/shop')}>Shop collection <span>↗</span></button>
    </header>
    <main>
      {route.page === 'home' && <Home onShop={() => navigate('/shop')} onCategory={(key) => navigate(categoryPath(key))} onAbout={() => navigate('/about')} />}
      {route.page === 'shop-index' && <CategoryDirectory onNavigate={navigate} />}
      {route.page === 'shop-all' && <Catalog onNavigate={navigate} />}
      {route.page === 'category' && <Catalog category={route.category} onNavigate={navigate} />}
      {route.page === 'product' && <Product key={route.product.id} product={route.product} onBack={() => navigate(categoryPath(route.product.category))} onOrder={order} customer={customer} setCustomer={setCustomer} whatsappFeedback={whatsappFeedback} />}
      {route.page === 'about' && <About />}
      {route.page === 'contact' && <Contact />}
      {route.page === 'not-found' && <section className="page-pad"><p className="eyebrow">PAGE NOT FOUND</p><h1>LET’S FIND<br/><em>YOUR PIECE.</em></h1><button className="text-link" onClick={() => navigate('/shop')}>BROWSE THE SHOP ↗</button></section>}
    </main>
    <Footer onNavigate={navigate} />
  </div>
}

function ProductViewer({ product }) {
  const mountRef = useRef(null)
  const [status, setStatus] = useState('Loading model…')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let disposed = false
    let cleanup
    const initialize = async () => {
      try {
        const [THREE, { GLTFLoader }, { OrbitControls }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js'),
        ])
        if (disposed) return

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#f3f2ee')
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 1000)
        camera.position.set(0, 0.4, 4.6)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        mount.appendChild(renderer.domElement)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.target.set(0, 0, 0)
        scene.add(new THREE.HemisphereLight('#ffffff', '#777777', 2.2))
        const light = new THREE.DirectionalLight('#ffffff', 3)
        light.position.set(3, 5, 4)
        scene.add(light)

        let frame
        let model
        const resize = () => {
          const { width, height } = mount.getBoundingClientRect()
          if (!width || !height) return
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          const fov = THREE.MathUtils.degToRad(camera.fov)
          const fitDistance = 2.5 / (2 * Math.tan(fov / 2) * Math.min(1, camera.aspect))
          camera.position.set(0, 0.4, Math.max(4.6, fitDistance))
          renderer.setSize(width, height, false)
        }
        resize()
        const observer = new ResizeObserver(resize)
        observer.observe(mount)
        const animate = () => {
          if (disposed) return
          controls.update()
          renderer.render(scene, camera)
          frame = requestAnimationFrame(animate)
        }
        animate()

        new GLTFLoader().load(product.model, (gltf) => {
          if (disposed) {
            gltf.scene.traverse((item) => item.geometry?.dispose())
            return
          }
          model = gltf.scene
          const bounds = new THREE.Box3().setFromObject(model)
          const size = bounds.getSize(new THREE.Vector3())
          const center = bounds.getCenter(new THREE.Vector3())
          const scale = 2.5 / Math.max(size.x, size.y, size.z)
          model.scale.setScalar(scale)
          model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
          scene.add(model)
          setStatus('Drag to rotate · scroll to zoom')
        }, undefined, () => {
          if (!disposed) setStatus('3D model unavailable')
        })

        cleanup = () => {
          cancelAnimationFrame(frame)
          observer.disconnect()
          controls.dispose()
          renderer.dispose()
          renderer.domElement.remove()
          model?.traverse((item) => {
            item.geometry?.dispose()
            const materials = Array.isArray(item.material) ? item.material : [item.material]
            materials.filter(Boolean).forEach((material) => {
              for (const value of Object.values(material)) if (value?.isTexture) value.dispose()
              material.dispose()
            })
          })
        }
      } catch {
        if (!disposed) setStatus('3D model unavailable')
      }
    }
    initialize()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [product.model])

  return <div className="local-viewer-wrap"><div className="local-viewer" ref={mountRef} role="img" aria-label={`Interactive 3D model of ${product.name}`} /><span className="model-status" aria-live="polite">{status}</span></div>
}

function Home({ onShop, onCategory, onAbout }) {
  return <>
    <section className="hero-section">
      <div className="hero-copy"><p className="eyebrow">EST. 2024 / DAR ES SALAAM</p><h1>WEAR<br/><em>YOUR</em><br/>WORLD.</h1><p className="hero-tagline">-That's juc Leg!t-🚀</p><button className="text-link" onClick={onShop}>SHOP THE COLLECTION <span>↗</span></button></div>
    </section>
    <section className="manifesto-strip"><p>BIGFISH IS A TANZANIAN STREETWEAR LABEL FOR PEOPLE WHO MOVE WITH INTENTION.</p><button className="circle-arrow" onClick={onAbout} aria-label="Read about BIGFISH">↘</button></section>
    <section className="home-categories page-pad">
      <div className="page-heading"><div><p className="eyebrow">DISCOVER / DROP 001</p><h2>SHOP BY<br/><em>CATEGORY.</em></h2></div><button className="text-link" onClick={onShop}>VIEW ALL PRODUCTS ↗</button></div>
      <div className="category-cards">{Object.entries(categories).map(([key, category]) => {
        const count = products.filter((product) => product.category === key).length
        return <button className="category-card" key={key} onClick={() => onCategory(key)}><span className="category-card-copy"><strong>{category.label}</strong><small>{count} {count === 1 ? 'piece' : 'pieces'} <b>↗</b></small></span></button>
      })}</div>
    </section>
  </>
}

function CategoryDirectory({ onNavigate }) {
  return <section className="shop-directory page-pad">
    <div className="catalog-crumb"><button onClick={() => onNavigate('/')}>HOME</button> / SHOP</div>
    <div className="page-heading"><div><p className="eyebrow">BIGFISH / DROP 001</p><h1>CHOOSE YOUR<br/><em>CATEGORY.</em></h1></div><p className="page-intro">Browse the collection by product type, or view everything together.</p></div>
    <button className="directory-all" onClick={() => onNavigate('/shop/all')}>VIEW ALL PRODUCTS <span>↗</span></button>
    <div className="category-directory-list" aria-label="Shop categories">{Object.entries(categories).map(([key, category], index) => {
      const count = products.filter((product) => product.category === key).length
      return <button className="category-directory-row" key={key} onClick={() => onNavigate(categoryPath(key))}>
        <span className="directory-index">0{index + 1}</span><strong>{category.label}</strong><small>{count} {count === 1 ? 'product' : 'products'}</small><span className="directory-arrow" aria-hidden="true">↗</span>
      </button>
    })}</div>
  </section>
}

function Catalog({ category: selectedCategory, onNavigate }) {
  const visible = selectedCategory ? products.filter((product) => product.category === selectedCategory) : products
  const heading = selectedCategory ? categories[selectedCategory].label : 'All Products'
  return <section className="products-page page-pad">
    <div className="catalog-crumb"><button onClick={() => onNavigate('/shop')}>SHOP</button>{selectedCategory && <> / {heading.toUpperCase()}</>}</div>
    <div className="page-heading"><div><p className="eyebrow">BIGFISH / DROP 001</p><h1>{selectedCategory ? heading : <>THE<br/><em>COLLECTION.</em></>}</h1></div><p className="page-intro">{selectedCategory ? `${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'} in ${heading}.` : 'A considered collection of headwear and clothing, made for everyday outfits with character.'}</p></div>
    <nav className="catalog-controls" aria-label="Product categories"><a className={!selectedCategory ? 'active' : ''} href="/shop/all" onClick={(event) => { event.preventDefault(); onNavigate('/shop/all') }}>All products</a>{Object.entries(categories).map(([key, item]) => <a className={selectedCategory === key ? 'active' : ''} key={key} href={categoryPath(key)} onClick={(event) => { event.preventDefault(); onNavigate(categoryPath(key)) }}>{item.label}</a>)}</nav>
    <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} onNavigate={onNavigate} />)}</div>
  </section>
}

function ProductCard({ product, onNavigate }) {
  return <article className="product-card">
    <button className="product-card-link" onClick={() => onNavigate(pathForProduct(product))} aria-label={`View ${product.name}`}>
      {product.image && <img className="catalog-image" src={product.image} alt={product.name} loading="lazy" />}
      <span className="product-index">{product.code}</span><span className="product-info"><strong>{product.name}</strong><small>{product.type}</small><b>{money(product.price)}</b></span>
      <span className="model-link-label">VIEW INTERACTIVE 3D MODEL <span>↗</span></span>
    </button>
  </article>
}

function Product({ product, onBack, onOrder, customer, setCustomer, whatsappFeedback }) {
  return <section className="product-page"><button className="back-link" onClick={onBack}>← BACK TO {categories[product.category].label.toUpperCase()}</button>
    <div className="product-layout"><div className="product-stage"><ProductViewer product={product} /><span className="stage-code">{product.code}</span></div>
      <div className="product-details"><p className="eyebrow">BIGFISH / {categories[product.category].label.toUpperCase()}</p><h1>{product.name}</h1><p className="product-type">{product.type}</p><p className="product-price">{money(product.price)}</p>
        <div className="order-fields"><label className="field-label">YOUR NAME<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Name (optional)" /></label><label className="field-label">LOCATION / CITY<input value={customer.location} onChange={(event) => setCustomer({ ...customer, location: event.target.value })} placeholder="Dar es Salaam (optional)" /></label><button className="order-button" onClick={() => onOrder(product, customer)}>ENQUIRE ON WHATSAPP <span>↗</span></button></div>
        <p className="order-note" aria-live="polite">{whatsappFeedback || 'WhatsApp opens with this product enquiry for you to review and send. No order is placed until details are confirmed with the BIGFISH team.'}</p>
      </div>
    </div>
  </section>
}

function About() { return <section className="about-page page-pad"><p className="eyebrow">ABOUT BIGFISH / 001</p><div className="about-grid"><h1>BUILT FOR<br/><em>THE ONES</em><br/>WHO KNOW.</h1><div className="about-copy"><p>BIGFISH is a Tanzanian streetwear label focused on high-quality limited drops. We make pieces with a point of view, released in small numbers and made to be worn hard.</p><p>Every order is personally handled through WhatsApp, with nationwide delivery across Tanzania.</p><p className="signature">-That's juc Leg!t-🚀</p></div></div><div className="about-rule"><span>FROM TANZANIA</span><span>FOR EVERYWHERE</span></div></section> }
function Contact() {
  const message = 'Hello BIGFISH, I have a question about the collection.'
  const url = whatsappUrl(message)
  return <section className="contact-page page-pad"><p className="eyebrow">GET IN TOUCH</p><h1>LET'S<br/><em>TALK.</em></h1><div className="contact-links"><a href="https://instagram.com/ivyaudrey.vsop._" target="_blank" rel="noreferrer"><span>Instagram</span>@ivyaudrey.vsop._ <b>↗</b></a><a href="mailto:mimiaudrey22@gmail.com"><span>Email</span>mimiaudrey22@gmail.com <b>↗</b></a><a className="whatsapp-contact" href={url || undefined} target={url ? '_blank' : undefined} rel={url ? 'noreferrer' : undefined} onClick={(event) => { if (!url) event.preventDefault() }}><span>WhatsApp</span><strong>{url ? 'Enquire on WhatsApp' : 'WhatsApp enquiries unavailable'}</strong><b>↗</b></a>{!url && <p className="whatsapp-unavailable">WhatsApp contact is not configured. Please use email for now.</p>}</div></section>
}
function Footer({ onNavigate }) { return <footer><div className="footer-top"><button className="wordmark footer-mark" onClick={() => onNavigate('/')}>BIGFISH<span>®</span></button><p>-That's juc Leg!t-🚀</p><button className="footer-arrow" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button></div><div className="footer-bottom"><span>© BIGFISH 2024</span><button onClick={() => onNavigate('/contact')}>CONTACT</button><span>MADE IN TANZANIA</span></div></footer> }

export default App
