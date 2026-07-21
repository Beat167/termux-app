export default function PromoBanner({ mode }) {
  return (
    <div className="promo-banner">
      <h2>{mode === 'tienda_oficial' ? 'Ofertas de tiendas oficiales' : 'Encuentra tesoros cerca de ti'}</h2>
      <p>
        {mode === 'tienda_oficial'
          ? 'Envío rápido y pago seguro, directo de marcas y tiendas verificadas.'
          : 'Compra y vende con vecinos de tu zona. Coordina la entrega directo con el vendedor.'}
      </p>
    </div>
  );
}
