# Marketplace app — MVP

Implementación funcional del diseño en `../docs/marketplace-app-design.md`:
backend compartido (Node.js) + web (React) + móvil (Expo/React Native).

```
marketplace-app/
  backend/   API REST (Express + SQLite)
  web/       Frontend web (React + Vite)
  mobile/    App Android/iOS (Expo / React Native)
```

## Funcionalidades incluidas en este MVP

- Registro/login de clientes y comerciantes.
- Catálogo público con búsqueda.
- Publicación de productos (comerciante).
- Reservas con tiempo límite.
- Regateo: oferta → aceptar / rechazar / contraofertar.
- Pedidos con descuento de stock y cambio de estado
  (`confirmado → en_preparacion → en_camino → entregado`).
- Notificaciones en la app (por evento: nueva reserva, nueva oferta,
  respuesta de oferta, cambio de estado del pedido).

Queda fuera de este MVP (ver el documento de diseño para el alcance completo):
pagos reales, push notifications nativas, repartidores, reseñas, mapas.

---

## 1. Backend (necesario para correr web y móvil)

Requiere Node.js (ya lo tienes instalado).

```bash
cd marketplace-app/backend
npm install
cp .env.example .env
npm run dev
```

Queda corriendo en `http://localhost:3000`. Prueba con:
`curl http://localhost:3000/api/health` → debe responder `{"ok":true}`.

La base de datos es un archivo SQLite (`marketplace.db`) que se crea solo
la primera vez que arranca. Bórralo si quieres reiniciar todos los datos.

## 2. Web (React + Vite)

En **otra terminal** de VS Code, con el backend ya corriendo:

```bash
cd marketplace-app/web
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador. El frontend ya está
configurado para hablar con el backend en `localhost:3000` (vía proxy de Vite).

## 3. Móvil (Expo / React Native) — sin necesidad de Android Studio

1. Instala en tu teléfono Android la app **Expo Go** (Play Store).
2. Averigua la IP local de tu computadora en la red WiFi:
   - Windows: `ipconfig` (busca "Dirección IPv4", algo como `192.168.1.x`)
   - Mac/Linux: `ifconfig` o `ip addr`
3. Edita `marketplace-app/mobile/src/config.js` y reemplaza la IP de
   ejemplo por la tuya:
   ```js
   export const API_URL = 'http://TU_IP_LOCAL:3000/api';
   ```
4. Con el backend corriendo (paso 1) y el celular en la **misma red WiFi**:
   ```bash
   cd marketplace-app/mobile
   npm install
   npx expo start
   ```
5. Escanea el código QR que aparece en la terminal con la app **Expo Go**
   (Android) o la cámara (iPhone). La app carga en tu teléfono al instante,
   sin compilar nada localmente.

### Generar el APK final (sin Android Studio)

Cuando quieras un `.apk` instalable (no solo probar con Expo Go):

```bash
npm install -g eas-cli
cd marketplace-app/mobile
eas login          # crea una cuenta gratuita en expo.dev si no tienes
eas build:configure
eas build -p android --profile preview
```

`eas build` compila el APK en la nube de Expo (no usa tu computadora) y al
terminar te da un link para descargarlo e instalarlo en el celular.
