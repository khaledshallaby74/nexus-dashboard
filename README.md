# NEXUS - Enterprise E-Commerce Dashboard

### Project Status: Under Active Development Application Architecture 
> **Note for Reviewers:** This ecosystem is currently in its core orchestration phase. Core reactive state management, centralized HTTP networks, and generic dynamic layout nodes are fully operational. Advanced analytical reporting modules and lazy-loaded extensions are under active construction.

---

## Project Overview
**NEXUS** is a next-generation, high-performance Enterprise E-Commerce Management Dashboard built to deliver pixel-perfect control over product inventories, structural categorization, metrics monitoring, and operational streams. 

The application architecture bridges bleeding-edge frontend reactive design with a fluid API backend, maximizing computation speed, cutting down layout repaints, and offering an immersive administrative workspace.

---

## Tech Stack & Architecture Pillars

* **Framework:** Angular 17+ (Strict Independent Standalone Architecture)
* **Reactivity Tier:** Native **Angular Signals** (`signal`, `computed`, `effect`) eliminating full-tree zone pollutions.
* **State Management:** Unified Flux-like In-Memory Cache Layer driven by Reactive State Records (`Record<number, Entity>`) for fast lookup $O(1)$.
* **Backend Interface:** Powered by the robust [DummyJSON API](https://dummyjson.com) ecosystem (`/products`, `/products/search`, `/products/category-list`).
* **Styling & UI:** Scalable Modular **SCSS Architecture** mimicking the enterprise 7-1 pattern for strict design token enforcement.

---

## Technical Highlights & Design Patterns

### 1. Full Reactive CRUD Grid Architecture
The system orchestrates a clean, decoupled **CRUD (Create, Read, Update, Delete)** pipeline backed fully by RxJS streams and Signal synchronization:
* **Read (Data Hydration):** Streamlined pagination via reactive query params (`limitState`, `skipState`, `currentPage`) bound to reactive filters.
* **Create & Update:** Handled by a shared smart form orchestrator (`ProductFormContextComponent`) that cleanly differentiates behaviors via component input boundaries, securing structural data mutations.
* **Delete:** Executed via an isolated pipeline that triggers instant cache purging in the store and recalculates matrix parameters smoothly.

### 2. Dual-Engine Presentation Layer (Table / Cards Toggle)
NEXUS implements a scalable view-mode toggle subsystem allowing administrators to switch presentation layers instantly without destroying the state or re-fetching data:
* **Declarative Toggle Strategy:** Managed via a centralized view signal (`viewMode = signal<'table' | 'cards'>('table')`).
* **Generic Table Engine:** Driven by a declarative cell configuration matrix (`TableColumnConfig[]`) that decouples HTML presentation from data shapes.
* **Adaptive Grid Deck:** Transforms the layout into highly visual, responsive data cards instantly upon user preference change, leveraging Angular's control flow for optimized structural compilation.

### 3. Centralized Enterprise Network Interceptor
A bulletproof `HttpInterceptorFn` acts as the traffic controller for the entire ecosystem:
* **Automatic Toast Hydration:** Extracts context directly from outbound URLs to generate elegant, standardized notifications for mutation actions (`POST`, `PUT`, `DELETE`, `PATCH`).
* **Network Resilience:** Embedded `timeout(7000)` filters guarding UI stability against weak connections.
* **Global Error Strategy:** Automated structural handling for `401 Unauthorized`, `404 Not Found`, and `500 Server Errors`.

---

## Exact Project Directory Blueprint (Feature-Driven)

```text
src/
├── app/
│   ├── core/                   # Singleton Services & App-Wide Configurations
│   │   ├── guards/             # Route protection workflows
│   │   ├── interceptors/       # Centralized HTTP traffic orchestration & auto-toasts
│   │   ├── models/             # App-level generic data contracts
│   │   └── services/           # Global single-instance utilities
│   ├── features/               # Modular Feature Domains (Isolated Contexts)
│   │   ├── auth/               # User Authentication Context
│   │   │   ├── components/ | models/ | pages/ | services/
│   │   ├── dashboard/          # Metrics & Core Analytical Views
│   │   │   ├── components/ | models/ | pages/ | services/
│   │   └── products/           # Inventory & Catalog Management (CRUD Core)
│   │       ├── components/ | models/ | pages/ | services/
│   ├── layout/                 # Structural Layout View Wrappers
│   │   ├── admin-layout/       # Shell workspace for authenticated managers
│   │   ├── auth-layout/        # Gateway viewport for login/registration
│   │   └── components/ | models/ | services/
│   └── shared/                 # Reusable Domain-Agnostic Core Elements
│       ├── components/         # Generic Dynamic Tables, Forms, Spinners, Pagination
│       ├── directives/         # Low-level UI behavior decorators
│       ├── models/             # Global layout contracts (TableColumnConfig, FormFieldConfig)
│       └── pipes/              # Custom reactive template formatters
├── environments/               # Environment target profiles (prod / dev base URLs)
└── styles/                     # Enterprise SCSS Style Architecture (7-1 Pattern)
    ├── abstract/               # Design Tokens: Mixins, Functions, Variables
    ├── base/                   # Reset CSS, Typography, HTML defaults
    ├── components/             # Custom global UI atom styles
    ├── themes/                 # Layout skins and dark/light definitions
    └── utilities/              # Atomic helper utility classes
