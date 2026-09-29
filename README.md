# 🛵 Advanced MERN Delivery Platform — Chowly

> A Deliveroo-style food delivery platform: a customer app, a rider app, and admin app, on one Node.js + MongoDB API.

> This code, whether in parts or whole, is licensed for commercial use **only with a license**. It is **free for personal use**.
> 👉 [Click here to obtain license](https://techwithemma.gumroad.com/l/huytmd) and 👉 [here to learn more](https://github.com/TechWithEmmaYT/Advanced-MERN-Delivery-Mobile-and-Admin-Platform/blob/main/TECHWITHEMMA-LICENSE.md)

## ❤️ Support the Channel

Love this project? Here’s how you can support:

* ☕ [Buy Me a Coffee](https://buymeacoffee.com/techwithemmaofficial)
* 🌟 Star this repo
* 🎥 [Subscribe on YouTube](https://tinyurl.com/subcribe-to-techwithEmma)

---

## 📦 What's Inside

| Folder     | What it is                | Stack                                                |
| ---------- | ------------------------- | ---------------------------------------------------- |
| `api/`     | REST API for all clients  | Express 5, TypeScript, MongoDB, Passport JWT
| `mobile/`  | Customer **and** rider app | Expo SDK 57, Expo Router, React Native 0.86, Uniwind  |
| `admin/`   | Backoffice dashboard      | Vite, React 19

One account model, three roles: `customer`, `driver`, `admin`.

---

## 🤖 Built with Claude Code

This project was built end to end with Claude Code, using Agent Skills.

👉 **Get the skills here: [techwithemma.com/skills](https://techwithemma.com/skills)**

Skills used in this build:

* 🗺️ `plan-project` — Discovery & Implementation Plan
* 🎨 `mobile-ui-design` — Screen Inventory & Visual Direction
* 🧱 `nodejs-scaffolding` — Express + MongoDB + JWT API
* 💳 `nodejs-payments` — Stripe Checkout & Webhooks
* 🎨 `expo-uniwind-theme` — Uniwind Theme & Dark Mode
* 📱 `expo-native-builder` — Expo Screens & Flows
* 🧩 `shadcn` — Admin UI Components
* 🌐 `agent-browser` — Browser Testing & Verification

---

## 🗝️ Key Features 👇

### 📱 Customer App

* 🔐 Authentication (Email + Password with JWT)
* 📍 Location Permission & Address Capture
* 🏠 Home Discovery
* 🗂️ Category
* 🖼️ Promo Banner Carousel
* 🔎 Search Restaurants & Dishes
* 🍕 Dish Options, Extras & Notes
* 🧺 Basket with Restaurant Switch Prompt
* 💳 Stripe Checkout (Payment Sheet)
* 📦 Orders List & Order Details
* 🗺️ Live Order Tracking with Map
* 🔢 Delivery Confirmation Code
* ♻️ Reorder Past Orders
* ⭐ Saved Addresses
* 🌙 Dark Mode
* ⏬ Pull to Refresh

### 🛵 Rider App

* 🟢 Go Online / Offline
* 📥 Open Delivery Queue
* 💷 Pay Per Delivery (Base + Distance)
* ✋ Claim Delivery
* 📦 Mark Picked Up & Delivered
* 🔐 Delivery Code Verification
* 💰 Daily Earnings & Stats

### 🖥️ Admin Dashboard

* 🔐 Admin Authentication & Route Guards
* 📈 Advanced Analytics (MongoDB Aggregate Pipeline)
* 📊 Revenue Chart & Orders by Status
* 🔴 Live Operations Feed
* 🧾 Orders Management & Status Updates
* 💵 Order Money Split (Commission, Payouts)
* 🏪 Restaurants CRUD
* 🍔 Dishes CRUD with Option Groups
* 🗂️ Categories with Drag & Drop Ordering
* 👥 Customers & Suspend / Reinstate
* 🚴 Riders Approval & Suspension
* 🖼️ Banners with Scheduling & Drag & Drop
* ⚙️ Platform Settings (Rider Pay, Commission, Service Fee)
* 🧑‍💼 Image Upload (Cloudinary)
* 🔍 Filter, Search & Pagination

### 🔌 API

* 🧱 Layered Architecture (Route → Controller → Service → Model)
* ✅ Zod Request Validation
* 🍪 JWT via HTTP-only Cookie or Bearer Token
* 🛡️ Role-Based Access (Customer, Driver, Admin)
* 💵 Server-Side Money Calculations
* 🪝 Stripe Webhooks with Idempotency
* 🖼️ Cloudinary Uploads
* 🌱 Database Seed Scripts

---

## 🧰 Requirements

* Node.js 20+
* MongoDB (Atlas or local)
* A Cloudinary account (images)
* A Stripe account, test mode (payments)
* Android Studio / Xcode for the mobile app, plus the Expo dev client

---

## 🚀 Getting Started

### 1. API

```bash
cd api
npm install
cp .env.example .env      # then fill it in
npm run dev               # http://localhost:8000
```
Seed the catalogue and the test accounts:

```bash
npm run seed:categories
npm run seed:restaurants
npm run seed:banners
npm run seed:admin
npm run seed:driver
```
For Stripe webhooks in development:

```bash
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
```

### 2. Admin

```bash
cd admin
npm install
npm run dev               # http://localhost:5173
```
### 3. Mobile

```bash
cd mobile
npm install
cp .env.example .env      # EXPO_PUBLIC_API_URL + the Maps keys
npx expo run:android      # or: npx expo run:ios
```
On an Android emulator, point the app at your machine and forward the API port:

```bash
adb reverse tcp:8000 tcp:8000
```

---

## 📱 Building the Mobile App

The app is native-only (`platforms: ["ios", "android"]`) and builds with EAS:

```bash
cd mobile
npx eas build --platform android --profile preview
```

The Maps keys come from `.env` locally; for cloud builds set them as EAS
environment variables, or the built app ships without a working map.

---

## 📜 License Information

A paid license is required for commercial use. To obtain a commercial license, please visit 👉 [Here](https://techwithemma.gumroad.com/l/huytmd)

For more details about the license, please refer to [TECHWITHEMMA-LICENSE.md](./TECHWITHEMMA-LICENSE.md).

---

# 📺 Subscribe for More Projects

If you find this helpful, support by subscribing and sharing:

🔗 [https://tinyurl.com/subcribe-to-techwithEmma](https://tinyurl.com/subcribe-to-techwithEmma)
