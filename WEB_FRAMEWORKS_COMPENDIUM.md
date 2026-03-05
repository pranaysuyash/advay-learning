# Web Frameworks, Libraries & Engines Compendium (2025-2026)

A comprehensive list of well-maintained web frameworks, libraries, and engines across key categories for modern web development.

---

## Table of Contents

1. [Audio](#1-audio)
2. [Game Engines](#2-game-engines)
3. [Physics Engines](#3-physics-engines)
4. [Animation](#4-animation)
5. [Graphics/Rendering](#5-graphicsrendering)
6. [Video/Media](#6-videomedia)
7. [UI Component Libraries](#7-ui-component-libraries)
8. [State Management](#8-state-management)
9. [Networking](#9-networking)
10. [Storage](#10-storage)
11. [Math/Utilities](#11-mathutilities)
12. [Build Tools](#12-build-tools)
13. [Data Visualization](#13-data-visualization)
14. [Maps/Geospatial](#14-mapsgeospatial)
15. [Machine Learning](#15-machine-learning)

---

## 1. Audio

### Tone.js
- **Description:** Web Audio framework for creating interactive music in the browser with DAW-like features
- **URL:** https://github.com/Tonejs/Tone.js | https://tonejs.github.io/
- **Key Features:**
  - Global transport for synchronizing and scheduling events
  - Prebuilt synths (Synth, FMSynth, AMSynth, NoiseSynth)
  - Polyphonic synthesis via PolySynth
  - Sample playback with Player and Sampler
  - Effects routing (Distortion, Filter, FeedbackDelay)
  - Audio-rate signal control with sample-accurate automation
  - MIDI support and musical time encoding (e.g., "4n", "8t", "1m")
- **Best Use Cases:** Interactive music applications, game audio, audio experimentation, scheduled audio events, sample-based instruments
- **Bundle Size:** Not specified
- **Maintenance:** ⚠️ Last release 14.7.39 (Jul 2020) - appears outdated, but has dev builds

### Howler.js
- **Description:** Modern audio library that defaults to Web Audio API and falls back to HTML5 Audio
- **URL:** https://github.com/goldfire/howler.js | https://howlerjs.com/
- **Key Features:**
  - Single API for all audio needs
  - Automatic caching for improved performance
  - Control sounds individually, in groups, or globally
  - Sound sprite definition and playback
  - Full control for fading, rate, seek, volume
  - 3D spatial sound and stereo panning
  - No dependencies, pure JavaScript
- **Best Use Cases:** Audio playback, streaming audio, game audio, audio sprites, radio streaming, cross-browser audio
- **Bundle Size:** ~7kb gzipped
- **Maintenance:** ✅ Active (v2.2.4, Sep 2023) | 25.2k stars | 94 contributors

---

## 2. Game Engines

### Three.js
- **Description:** JavaScript 3D library for creating easy-to-use, lightweight, cross-browser 3D graphics
- **URL:** https://github.com/mrdoob/three.js | https://threejs.org/
- **Key Features:**
  - WebGL and WebGPU renderers
  - SVG and CSS3D renderers (addons)
  - WebXR support for VR/AR
  - Easy-to-use API with extensive documentation
  - Large ecosystem of examples and plugins
- **Best Use Cases:** 3D graphics rendering, VR/AR experiences, interactive 3D visualizations, 3D games, product configurators
- **Bundle Size:** Varies by build (modular)
- **Maintenance:** ✅ Highly Active (r183, Feb 2026) | 111k stars | 2,032 contributors

### Phaser
- **Description:** Fast, free, open source HTML5 game framework with WebGL and Canvas rendering
- **URL:** https://github.com/photonstorm/phaser | https://phaser.io/
- **Key Features:**
  - Dual rendering (WebGL + Canvas)
  - Cross-platform (desktop and mobile)
  - JavaScript and TypeScript support
  - 40+ framework integrations (React, Vue, Angular, Svelte, etc.)
  - Bundler support (Vite, Rollup, Webpack, etc.)
  - Phaser Compressor for up to 60% bundle reduction
  - Extensive plugin ecosystem
- **Best Use Cases:** HTML5 games, YouTube Playables, Discord Activities, Twitch overlays, platformers, puzzle games, rogue-likes
- **Bundle Size:** Optimizable with Phaser Compressor (up to 60% reduction)
- **Maintenance:** ✅ Highly Active (v3.90.0, May 2025) | 39.1k stars | Commercial backing by Phaser Studio Inc

### Babylon.js
- **Description:** Powerful, open game and rendering engine packed into a friendly JavaScript framework
- **URL:** https://github.com/babylonjs/Babylon.js | https://babylonjs.com/
- **Key Features:**
  - WebGL, WebGL2, and WebGPU support
  - WebVR and WebXR support
  - WebAudio integration
  - Full TypeScript typing support
  - 3D game engine with lighting, cameras, mesh building
  - glTF support and 3D tool exporters (Blender, Maya, 3DS Max, Unity)
- **Best Use Cases:** 3D game development, interactive 3D experiences, VR/AR applications, 3D model viewing, shader development
- **Bundle Size:** Available in minified and debug builds
- **Maintenance:** ✅ Highly Active (v8.53.1, Mar 2026) | 25.2k stars | 601 releases

### PlayCanvas Engine
- **Description:** Open-source HTML5 game engine using WebGL2, WebGPU, and WebXR
- **URL:** https://github.com/playcanvas/engine | https://playcanvas.com/
- **Key Features:**
  - Advanced 2D + 3D graphics (WebGL2 & WebGPU)
  - State-based animation system
  - 3D rigid-body physics (ammo.js integration)
  - Input APIs (mouse, keyboard, touch, gamepad, VR)
  - 3D positional sounds
  - glTF 2.0, Draco, and Basis compression
  - TypeScript/JavaScript scripting
- **Best Use Cases:** HTML5 games, interactive 3D content, VR/AR experiences, visualization, advertising
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v2.16.2, Feb 2026) | Used by Disney, Facebook, Samsung, King, Miniclip, Zynga

### Godot Engine (Web Export)
- **Description:** Free, open-source, cross-platform game engine for 2D and 3D games
- **URL:** https://github.com/godotengine/godot | https://godotengine.org/
- **Key Features:**
  - Unified 2D and 3D interface
  - Comprehensive game development tools
  - One-click multi-platform export
  - MIT license (no royalties)
  - GDScript and C# support
- **Best Use Cases:** 2D/3D game development, multi-platform deployment, indie game development
- **Bundle Size:** Web export varies by project
- **Maintenance:** ✅ Highly Active (v4.6.1-stable, Feb 2026) | 107k stars | 3,215 contributors

### PixiJS
- **Description:** Fastest, most lightweight 2D library for the web using WebGL and WebGPU
- **URL:** https://github.com/pixijs/pixijs | https://pixijs.com/
- **Key Features:**
  - WebGL & WebGPU renderers
  - Asset loader
  - Multi-touch support
  - Text rendering (bitmap & dynamic)
  - SVG and primitive drawing
  - Dynamic textures, masking, filters
  - Advanced blend modes
- **Best Use Cases:** 2D game development, interactive graphics, data visualization, cross-platform applications
- **Bundle Size:** Emphasized as "most lightweight"
- **Maintenance:** ✅ Active (v8.16.0, Feb 2026) | 46.7k stars | 518 contributors

### A-Frame
- **Description:** Web framework for building browser-based 3D, AR, and VR experiences
- **URL:** https://github.com/aframevr/aframe | https://aframe.io/
- **Key Features:**
  - Declarative HTML-based approach
  - Entity-component architecture
  - Built on Three.js
  - WebXR support (VR headsets, mobile, desktop)
  - Visual inspector (Ctrl+Alt+I)
  - Built-in components (geometries, materials, lights, animations, models)
- **Best Use Cases:** VR/AR experiences, 3D web content, education, art installations, gaming, prototyping
- **Bundle Size:** Available via CDN (v1.7.1)
- **Maintenance:** ✅ Active (v1.7.1, Apr 2025) | 17.5k stars | 418 contributors

---

## 3. Physics Engines

### Matter.js (2D)
- **Description:** JavaScript 2D rigid body physics engine for the web
- **URL:** https://github.com/liabru/matter-js | https://brm.io/matter-js/
- **Key Features:**
  - Rigid, compound, and composite bodies
  - Concave/convex hulls
  - Mass, area, density, restitution
  - Multi-stage collision detection
  - Stable stacking/resting
  - Constraints, gravity, sleeping bodies
  - Canvas renderer and debugging tools
  - Time scaling (slow-mo, speed-up)
- **Best Use Cases:** Game development, interactive web experiences, physics simulations, educational demos
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active | 18.1k stars | 25 contributors | Used by Google, Phaser

### Planck.js (2D)
- **Description:** JavaScript/TypeScript rewrite of Box2D for HTML5 game development
- **URL:** https://github.com/shakiba/planck.js
- **Key Features:**
  - Box2D physics simulation
  - TypeScript support (99.1%)
  - Idiomatic JavaScript/TypeScript API
  - Optimized for web and mobile
- **Best Use Cases:** HTML5 games, cross-platform 2D games, physics simulation, Canvas-based games
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active | 5.2k stars | Modern tooling (Vite, ESLint, TypeScript)

### Rapier (2D & 3D)
- **Description:** Set of 2D and 3D physics engines written in Rust with JavaScript/TypeScript bindings
- **URL:** https://github.com/dimforge/rapier
- **Key Features:**
  - Both 2D and 3D physics simulation
  - High performance (Rust-based)
  - NPM packages for JavaScript/TypeScript
  - Multiple crates (rapier2d, rapier3d, rapier2d-f64, rapier3d-f64)
- **Best Use Cases:** Game development, physics-based animation, robotics simulation, web development
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active | 5.2k stars | 75 contributors | Apache-2.0 license

### Cannon.js / cannon-es (3D)
- **Description:** Lightweight 3D physics engine for JavaScript
- **URL:** https://github.com/pmndrs/cannon-es (maintained fork)
- **Key Features:**
  - 3D rigid body physics
  - Collision detection
  - Constraints and joints
  - Lightweight and fast
- **Best Use Cases:** 3D games, Three.js integration, physics simulations
- **Bundle Size:** Lightweight
- **Maintenance:** ✅ Active (cannon-es fork) | Popular with react-three-fiber ecosystem

---

## 4. Animation

### GSAP (GreenSock Animation Platform)
- **Description:** Framework-agnostic JavaScript animation library for high-performance animations
- **URL:** https://github.com/greensock/GSAP | https://greensock.com/gsap/
- **Key Features:**
  - Works with CSS, SVG, canvas, React, Vue, WebGL
  - Up to 20x faster than jQuery
  - Zero dependencies
  - ScrollTrigger plugin for scroll-based animations
  - gsap.matchMedia() for responsive animations
  - Optional plugins: MorphSVG, SplitText, motion paths, Draggable
  - React integration with useGSAP() hook
- **Best Use Cases:** Scroll-driven animations, responsive web animations, React/Vue animations, SVG morphing, text animations
- **Bundle Size:** Every major ad network excludes GSAP from file size calculations
- **Maintenance:** ✅ Active | 24k stars | Used on 12M+ sites | Free for commercial use

### Motion (Motion Division)
- **Description:** Open-source animation library for JavaScript, React, and Vue with hybrid engine
- **URL:** https://github.com/motiondivision/motion | https://motion.dev/
- **Key Features:**
  - Hybrid engine (JavaScript + native browser APIs)
  - 120fps, GPU-accelerated animations
  - Simple API for React, JavaScript, and Vue
  - TypeScript support, tree-shakable
  - Gestures, springs, layout transitions, scroll-linked effects, timelines
- **Best Use Cases:** UI component animations, scroll-linked effects, gesture-based interactions, spring animations, layout transitions
- **Bundle Size:** Tiny footprint (optimized)
- **Maintenance:** ✅ Highly Active | 31.1k stars | 140 contributors | Powers Framer and Cursor

### Framer Motion
- **Description:** Production-ready motion library for React
- **URL:** https://www.framer.com/motion/
- **Key Features:**
  - Declarative animations
  - Gesture support
  - Layout animations
  - Shared element transitions
  - SVG and CSS animations
  - Spring physics
- **Best Use Cases:** React applications, UI animations, page transitions, gesture-based interactions
- **Bundle Size:** Optimized for production
- **Maintenance:** ✅ Active | Widely adopted in React ecosystem

### Anime.js
- **Description:** Lightweight JavaScript animation library with simple, powerful API
- **URL:** https://github.com/juliangarnier/anime | https://animejs.com/
- **Key Features:**
  - Works with CSS properties, SVG, DOM attributes, JavaScript Objects
  - Advanced animation controls (stagger, loop, alternate, easing)
  - Multiple build formats (ESM, UMD, CJS, IIFE)
  - TypeScript support
- **Best Use Cases:** DOM element animations, SVG animations, Canvas animations, complex animation sequences
- **Bundle Size:** Lightweight
- **Maintenance:** ✅ Active (v4.3.6, Feb 2026) | 66.7k stars | 62.2k+ users

### React Spring
- **Description:** Cross-platform, spring-physics first animation library for React
- **URL:** https://github.com/pmndrs/react-spring | https://www.react-spring.dev/
- **Key Features:**
  - Cross-platform (react-dom, react-native, react-three-fiber, react-konva)
  - Spring-physics based animations
  - Declarative and imperative APIs
  - Duration/easing support
  - TypeScript support (98.8%)
- **Best Use Cases:** Fade-in/out animations, UI transitions, interactive animations, cross-platform animated components
- **Bundle Size:** Modular (@react-spring/web recommended for smaller bundles)
- **Maintenance:** ✅ Active (v10.0.3, Sep 2025) | 29.1k stars

### Tween.js
- **Description:** JavaScript/TypeScript tweening engine for easy animations
- **URL:** https://github.com/tweenjs/tween.js
- **Key Features:**
  - Optimized Robert Penner's equations
  - Reusable easing functions
  - Custom easing functions
  - Flexible integration (doesn't manage animation loop)
  - Supports relative values, repeat, yoyo, pause/resume
- **Best Use Cases:** Interactive animations, 3D graphics animation (Three.js), graph animations, video/time synchronization
- **Bundle Size:** Multiple build formats (ESM recommended)
- **Maintenance:** ✅ Active (v25.0.0, Jul 2024) | 10.1k stars

### Locomotive Scroll
- **Description:** Lightweight scroll library for smooth scrolling and parallax effects
- **URL:** https://github.com/locomotivemtl/locomotive-scroll | https://scroll.locomotive.ca/
- **Key Features:**
  - Built on Lenis
  - Dual Intersection Observers
  - Smart touch detection (parallax auto-disabled on mobile)
  - Accessible (native scrollbar, keyboard navigation, ARIA)
  - TypeScript first
- **Best Use Cases:** Smooth scrolling, parallax effects, viewport element detection, scroll-based animations
- **Bundle Size:** 9.4kB gzipped
- **Maintenance:** ✅ Active (v5.0.1, Jan 2026) | 8.7k stars

### Lenis
- **Description:** Lightweight, robust, and performant smooth scroll library
- **URL:** https://github.com/darkroomengineering/lenis
- **Key Features:**
  - Smooth scrolling with customizable easing
  - Multi-framework support (Vanilla JS, React, Vue, Framer)
  - GSAP ScrollTrigger integration
  - Touch and wheel event support
  - Infinite scrolling
  - Horizontal and vertical scroll orientation
- **Best Use Cases:** WebGL scroll syncing, parallax effects, image grid animations, SVG shape animations, Webflow sites
- **Bundle Size:** Lightweight
- **Maintenance:** ✅ Active (v1.3.17, Dec 2025) | 13.3k stars | 21.7k+ users

---

## 5. Graphics/Rendering

### Three.js
- **Description:** (See Game Engines section) - Also the leading 3D graphics library
- **URL:** https://github.com/mrdoob/three.js | https://threejs.org/
- **Best Use Cases:** 3D rendering, WebGL/WebGPU graphics, VR/AR, data visualization

### React Three Fiber
- **Description:** React renderer for Three.js for declarative 3D scene building
- **URL:** https://github.com/pmndrs/react-three-fiber
- **Key Features:**
  - No limitations - everything in Three.js works
  - No performance overhead - renders outside React
  - Future-proof - new Three.js features instantly available
  - Declarative scene building with reusable components
  - Full TypeScript support
- **Best Use Cases:** 3D web applications, product configurators, CAD/modeling tools, AI 3D generation, floor planners, real estate
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v9.5.0, Dec 2025) | 30.3k stars | 28.6k+ users

### PixiJS
- **Description:** (See Game Engines section) - Fastest 2D WebGL/WebGPU renderer
- **URL:** https://github.com/pixijs/pixijs | https://pixijs.com/
- **Best Use Cases:** 2D graphics, interactive visuals, data visualization, cross-platform apps

### D3.js
- **Description:** Low-level JavaScript library for visualizing data using web standards
- **URL:** https://github.com/d3/d3 | https://d3js.org/
- **Key Features:**
  - SVG, Canvas, and HTML rendering
  - Unparalleled flexibility for custom visualizations
  - Foundation for higher-level chart libraries
  - Data-driven document manipulation
- **Best Use Cases:** Interactive data visualizations, custom charts, dynamic graphics, data journalism
- **Bundle Size:** Not specified (modular)
- **Maintenance:** ✅ Active (v7.9.0, Mar 2024) | 112k stars | 467k+ users

### p5.js
- **Description:** JavaScript library for accessible creative coding
- **URL:** https://github.com/processing/p5.js | https://p5js.org/
- **Key Features:**
  - Full set of drawing tools
  - Audio-visual, interactive, generative works support
  - Multi-language accessibility
  - Extendable with community libraries
  - Currently transitioning to p5.js 2.0
- **Best Use Cases:** Creative coding, generative art, education, interactive installations, web-based visual design
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v2.2.2, Feb 2026) | 23.5k stars | 703 contributors | Processing Foundation

### Mapbox GL JS
- **Description:** Interactive, customizable vector maps using WebGL
- **URL:** https://github.com/mapbox/mapbox-gl-js | https://www.mapbox.com/
- **Key Features:**
  - Vector tile rendering
  - Custom styling
  - Point clustering
  - Data-driven visualizations
  - 3D terrain support
  - Cross-platform SDK compatibility
- **Best Use Cases:** Interactive web maps, geospatial visualization, location-based apps, 3D terrain, satellite imagery
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v3.19.1, Mar 2026) | 12,975 commits | Requires Mapbox account

### Leaflet
- **Description:** Leading open-source JavaScript library for interactive maps
- **URL:** https://github.com/Leaflet/Leaflet | https://leafletjs.com/
- **Key Features:**
  - Works across all major desktop and mobile platforms
  - Beautiful, easy-to-use API
  - Extensible with huge plugin ecosystem
  - Simple, readable source code
- **Best Use Cases:** Interactive web mapping, mobile-friendly maps, humanitarian coordination, event documentation
- **Bundle Size:** ~40 kB gzipped JS, ~3.2 kB gzipped CSS
- **Maintenance:** ✅ Active (v1.9.4, May 2023) | 44.6k stars | 865 contributors

---

## 6. Video/Media

### Video.js
- **Description:** Full-featured, open source HTML5 video player and framework
- **URL:** https://github.com/videojs/video.js | https://videojs.com/
- **Key Features:**
  - Supports all common media formats (HLS, DASH, MP4, WebM, OGV)
  - Cross-platform (desktop, mobile, tablets, Smart TVs)
  - Extensible plugin ecosystem (hundreds of plugins)
  - Free CDN-hosted version
  - Event-driven API
  - Video.js 10 announced for early 2026
- **Best Use Cases:** Web-based video playback, streaming media, custom video players, cross-platform video solutions
- **Bundle Size:** Minified builds available
- **Maintenance:** ✅ Active (v8.23.4, Aug 2025) | 39.5k stars | 471 contributors | Billions of monthly users

### FFmpeg.wasm
- **Description:** Pure WebAssembly/JavaScript port of FFmpeg for browser-based media processing
- **URL:** https://github.com/ffmpegwasm/ffmpeg.wasm | https://ffmpegwasm.netlify.app/
- **Key Features:**
  - Video/audio recording in browser
  - Video/audio conversion (transcoding)
  - Streaming capabilities
  - Pure WebAssembly (no server processing)
- **Best Use Cases:** In-browser media transcoding, client-side recording, browser-based streaming, privacy-sensitive processing
- **Bundle Size:** Not specified (WASM core)
- **Maintenance:** ✅ Active (v12.15, Jan 2025) | 17.2k stars | 72 contributors

### DPlayer
- **Description:** HTML5 danmaku (bullet comment) video player
- **URL:** https://github.com/DIYgod/DPlayer | https://dplayer.js.org/
- **Key Features:**
  - Danmaku (scrolling comment) support
  - Multiple CDN options
  - Plugin system
  - Node.js backend support
  - CMS integrations (WordPress, Typecho, etc.)
- **Best Use Cases:** Danmaku-enabled video players, video sharing platforms, interactive video experiences
- **Bundle Size:** Not specified
- **Maintenance:** ⚠️ Check original repo (DIYgod/DPlayer) for active maintenance

### MediaPipe
- **Description:** Cross-platform on-device machine learning for live and streaming media
- **URL:** https://github.com/google/mediapipe | https://developers.google.com/mediapipe
- **Key Features:**
  - Cross-platform APIs (MediaPipe Tasks)
  - Pre-trained models
  - MediaPipe Model Maker for customization
  - MediaPipe Studio for visualization
  - Vision, text, and audio processing
- **Best Use Cases:** Real-time computer vision (face, hand, pose tracking), video processing, 3D perception, accessibility, creative applications
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v0.10.32, Jan 2026) | 34k stars | Google AI Edge

---

## 7. UI Component Libraries

### Material UI (MUI)
- **Description:** Comprehensive React component library implementing Material Design
- **URL:** https://github.com/mui/material-ui | https://mui.com/
- **Key Features:**
  - Comprehensive Material Design implementation
  - MUI X for complex components (data grids, charts, date pickers)
  - Joy UI (experimental, in-house design)
  - Rigorously tested
  - Free under MIT license
- **Best Use Cases:** React applications with Material Design, enterprise design systems, data-heavy applications
- **Bundle Size:** Not specified (modular)
- **Maintenance:** ✅ Highly Active (v7.3.8, Feb 2026) | 98k stars | 2M+ users

### Chakra UI
- **Description:** Component system for building products with speed
- **URL:** https://github.com/chakra-ui/chakra-ui | https://chakra-ui.com/
- **Key Features:**
  - Accessible components (WAI-ARIA)
  - Composable APIs
  - Dark mode support
  - CSS-in-JS (Emotion)
  - TypeScript support (85.1%)
  - Next.js RSC support
- **Best Use Cases:** SaaS products, design systems, accessible web apps, Next.js applications, rapid prototyping
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v3.34.0, Mar 2026) | 40.3k stars | 387k+ users

### Radix Primitives
- **Description:** Low-level, accessible UI component library for design systems
- **URL:** https://github.com/radix-ui/primitives | https://radix-ui.com/primitives
- **Key Features:**
  - Accessibility-first design
  - Highly customizable
  - Developer experience focused
  - Incremental adoption
  - TypeScript (95.5%)
- **Best Use Cases:** Building design systems, accessible web apps, React projects, incremental UI improvements
- **Bundle Size:** Not specified (per-package)
- **Maintenance:** ✅ Active | 18.7k stars | Maintained by WorkOS

### shadcn/ui
- **Description:** Beautifully-designed, accessible components with full code access
- **URL:** https://github.com/shadcn/ui | https://ui.shadcn.com/
- **Key Features:**
  - Built on Radix UI primitives
  - Tailwind CSS styling
  - Highly customizable and extendable
  - Framework-compatible (React, Next.js)
  - Open source with full code access
- **Best Use Cases:** Building custom component libraries, rapid UI development, accessible web apps, modernizing frontends
- **Bundle Size:** Not specified (copy-paste components)
- **Maintenance:** ✅ Active (v3.8.5, Feb 2026) | 108k stars | 470 contributors

### Headless UI
- **Description:** Completely unstyled, fully accessible UI components for Tailwind CSS
- **URL:** https://github.com/tailwindlabs/headlessui | https://headlessui.com/
- **Key Features:**
  - Completely unstyled (full design control)
  - Fully accessible
  - React and Vue support
  - Tailwind CSS integration package
  - Insiders builds available
- **Best Use Cases:** Accessible UI components for React/Vue with Tailwind, full styling control, custom design systems
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v2.2.9, Sep 2025) | 28.4k stars | Tailwind Labs

### Bootstrap
- **Description:** Most popular HTML, CSS, and JavaScript framework for responsive, mobile-first development
- **URL:** https://github.com/twbs/bootstrap | https://getbootstrap.com/
- **Key Features:**
  - Responsive, mobile-first design
  - Compiled and minified assets
  - RTL support
  - Bundled JavaScript (includes Popper)
  - Sass/SCSS support
  - ESM support
  - Modular structure
- **Best Use Cases:** Responsive websites, rapid development, cross-browser compatibility, RTL languages, customizable theming
- **Bundle Size:** Multiple builds (CSS, JS, grid, utilities, RTL)
- **Maintenance:** ✅ Active (v5.3.8, Aug 2025) | 174k stars | 1,397 contributors

### Semantic UI
- **Description:** UI component framework based on natural language principles
- **URL:** https://github.com/Semantic-Org/Semantic-UI | https://semantic-ui.com/
- **Key Features:**
  - 50+ UI elements
  - 3000+ CSS variables
  - 3 levels of variable inheritance
  - EM values for responsive design
  - Flexbox friendly
- **Best Use Cases:** Responsive websites, UI theming, framework integration (React, Angular, Meteor)
- **Bundle Size:** Multiple options (full, CSS-only, LESS-only)
- **Maintenance:** ⚠️ Limited (v2.5.0, Oct 2022) | 966 open issues

### Hyperapp
- **Description:** Tiny (~1kB) JavaScript framework for building hypertext applications
- **URL:** https://github.com/hyperapp/hyperapp
- **Key Features:**
  - Minimalist API (views, actions, effects, subscriptions)
  - Declarative, functional
  - Ultra-lightweight (~1kB)
  - No build step required
  - Official packages for DOM, SVG, HTTP, etc.
- **Best Use Cases:** Lightweight web apps, minimal bundle size projects, learning framework fundamentals, rapid prototyping
- **Bundle Size:** ~1kB
- **Maintenance:** ⚠️ Limited (v2.0.0, Jul 2019) | Active Discord community

---

## 8. State Management

### Redux
- **Description:** Predictable and maintainable global state management
- **URL:** https://github.com/reduxjs/redux | https://redux.js.org/
- **Key Features:**
  - Single source of truth
  - Pure reducer functions
  - Action-based architecture
  - Time traveling debugger
  - Works with any view library
  - Redux Toolkit recommended
- **Best Use Cases:** Apps with significant state changes, single source of truth needs, cross-platform apps, easy testing
- **Bundle Size:** 2kB (core, including dependencies)
- **Maintenance:** ✅ Active (v5.0.1, Dec 2023) | 61.4k stars | 4.9M+ users

### Redux Toolkit
- **Description:** Official, opinionated toolset for efficient Redux development
- **URL:** https://github.com/reduxjs/redux-toolkit | https://redux-toolkit.js.org/
- **Key Features:**
  - configureStore() - simplified setup
  - createReducer() - mutable-style immutable updates (Immer)
  - createSlice() - auto-generates reducers and actions
  - createAsyncThunk() - async logic handling
  - createEntityAdapter() - normalized data management
  - RTK Query - data fetching and caching
- **Best Use Cases:** Simplifying Redux setup, reducing boilerplate, data fetching, normalized state, React + Redux apps
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v2.11.2, Dec 2025) | 11.2k stars | TypeScript (97.4%)

### Zustand
- **Description:** Small, fast, scalable state-management using simplified flux principles
- **URL:** https://github.com/pmndrs/zustand
- **Key Features:**
  - Hook-based API (no context providers)
  - Immutable state updates
  - Flexible state types
  - Middleware support (persist, immer, devtools, redux)
  - Vanilla/non-React usage
  - TypeScript support
  - Transient updates (without re-renders)
- **Best Use Cases:** React state management without boilerplate, global state, localStorage persistence, complex nested state
- **Bundle Size:** ~1KB gzipped
- **Maintenance:** ✅ Active (v5.0.11, Feb 2026) | 57.2k stars | 884K+ users

### TanStack Query (React Query)
- **Description:** Async state management for server state
- **URL:** https://github.com/TanStack/query | https://tanstack.com/query
- **Key Features:**
  - Protocol-agnostic fetching (REST, GraphQL, promises)
  - Caching, refetching, pagination, infinite scroll
  - Mutations, dependent queries, background updates
  - Prefetching, cancellation, React Suspense
  - Cross-framework (React, Solid, Svelte, Vue, Preact)
- **Best Use Cases:** Async state management, server-state caching, data fetching, stale-while-revalidate patterns
- **Bundle Size:** Size-limit configured
- **Maintenance:** ✅ Highly Active (v5.92.0, Mar 2026) | 48.7k stars | 1,053 contributors

### SWR
- **Description:** React Hooks library for data fetching with stale-while-revalidate strategy
- **URL:** https://github.com/vercel/swr | https://swr.vercel.app/
- **Key Features:**
  - Fast, lightweight, reusable
  - Transport and protocol agnostic
  - Built-in cache and request deduplication
  - Real-time updates
  - Revalidation on focus/network recovery
  - Polling, pagination, SSR/SSG
  - Optimistic UI (local mutation)
  - TypeScript, Suspense, React Native support
- **Best Use Cases:** Data fetching in React, Next.js apps, React Native, caching, pagination, polling, optimistic UI
- **Bundle Size:** Lightweight
- **Maintenance:** ✅ Active (v2.4.0, Feb 2026) | 32.3k stars | 526K+ users | By Vercel/Next.js team

---

## 9. Networking

### Socket.IO
- **Description:** Realtime application framework for Node.js with bidirectional event-based communication
- **URL:** https://github.com/socketio/socket.io | https://socket.io/
- **Key Features:**
  - Built on WebSocket with fallback options
  - Bidirectional event-based communication
  - TypeScript support (64.1%)
  - Room support
  - Automatic reconnection
- **Best Use Cases:** Real-time web apps (chat, collaboration), live event broadcasting, real-time analytics, multiplayer gaming
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v4.8.2, Dec 2025) | 62.9k stars | 5.7M+ users

### Axios
- **Description:** Promise-based HTTP client for browser and Node.js
- **URL:** https://github.com/axios/axios | https://axios-http.com/
- **Key Features:**
  - Browser (XMLHttpRequests) and Node.js support
  - Promise-based API
  - Request/response interceptors
  - Automatic data transformation
  - Request cancellation (AbortController)
  - Automatic JSON handling
  - Form serialization (multipart/form-data, x-www-form-urlencoded)
  - XSRF protection
  - Progress capturing
  - HTTP2 support (experimental)
  - Fetch adapter (v1.7.0+)
- **Best Use Cases:** API communication, form submissions, file uploads/downloads, authentication, concurrent requests, SSR
- **Bundle Size:** CDN bundles available
- **Maintenance:** ✅ Active (v1.13.6, Feb 2026) | 109k stars | 551 contributors

### WebRTC Samples
- **Description:** Official WebRTC code samples and demos
- **URL:** https://github.com/webrtc/samples | https://webrtc.github.io/samples/
- **Key Features:**
  - Collection of WebRTC JavaScript samples
  - Live demos for testing
  - Comprehensive test suite
  - ESLint and Stylelint configured
- **Best Use Cases:** Learning WebRTC, testing features, code reference, education
- **Bundle Size:** Not packaged (samples)
- **Maintenance:** ✅ Active | 14.6k stars | 2,769 commits

### Simple Peer
- **Description:** Simple WebRTC for the masses
- **URL:** https://github.com/feross/simple-peer
- **Key Features:**
  - Simplified WebRTC API
  - Data channels
  - Video/audio calls
  - NAT traversal
- **Best Use Cases:** P2P connections, video chat, file sharing, WebRTC abstraction
- **Bundle Size:** Lightweight
- **Maintenance:** Check repo for current status

---

## 10. Storage

### Dexie.js
- **Description:** Minimalistic IndexedDB wrapper with a simple, fun API
- **URL:** https://github.com/dexie/Dexie.js | https://dexie.org/
- **Key Features:**
  - Workaround for IndexedDB bugs
  - High performance with bulk operations
  - Rich API (50+ operations)
  - Framework support (React, Svelte, Vue, Angular)
  - TypeScript support
  - Dexie Cloud add-on for syncing
- **Best Use Cases:** Offline storage, PWAs, Electron apps, Capacitor apps, sync-enabled apps
- **Bundle Size:** UMD and ES Module builds
- **Maintenance:** ✅ Active (v4.3.0, Jan 2026) | 14.1k stars | 100K+ websites

### localForage
- **Description:** Fast, simple storage library using asynchronous storage (IndexedDB/WebSQL)
- **URL:** https://github.com/localForage/localForage | https://localforage.dev/
- **Key Features:**
  - Callbacks and Promises support
  - Multiple storage backends (IndexedDB, WebSQL, localStorage)
  - Stores any serializable object, ArrayBuffers, Blobs, TypedArrays
  - Configurable database options
  - Multiple instances
  - Framework drivers (Angular, Vue, Backbone, Ember)
  - Custom driver support
  - TypeScript support
- **Best Use Cases:** Offline web apps, cross-browser storage, large data storage, PWAs
- **Bundle Size:** ~29 kB minified, ~8.8 kB gzipped, ~7.8 kB Brotli (v1.7.3)
- **Maintenance:** ⚠️ Limited (Aug 2021) | 25.8k stars | 215 open issues

### IndexedDB (Native)
- **Description:** Built-in browser database for significant amounts of structured data
- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Key Features:**
  - Native browser support
  - Transactional database
  - Large storage capacity
  - Asynchronous API
- **Best Use Cases:** Large offline data, complex queries, structured data storage
- **Bundle Size:** N/A (native)
- **Maintenance:** ✅ Web standard

---

## 11. Math/Utilities

### glMatrix
- **Description:** JavaScript vector and matrix library for high-performance WebGL applications
- **URL:** https://github.com/toji/gl-matrix | https://glmatrix.net/
- **Key Features:**
  - Hand-tuned, optimized functions
  - Efficient API conventions
  - Float32Array and regular array support
  - Comprehensive vector/matrix operations
- **Best Use Cases:** WebGL graphics, physics simulations, vector/matrix math, game development
- **Bundle Size:** Size-snapshot configured
- **Maintenance:** ✅ Active (v3.4.4, Aug 2025) | 5.7k stars | 90 contributors

### Lodash
- **Description:** Modern JavaScript utility library with modularity and performance
- **URL:** https://github.com/lodash/lodash | https://lodash.com/
- **Key Features:**
  - Array, number, object, string utilities
  - Multiple module formats (lodash-es, lodash/fp, lodash-amd)
  - Core build (~4 kB gzipped)
  - Full build (~24 kB gzipped)
  - Cherry-pick individual methods
- **Best Use Cases:** Iterating arrays/objects/strings, manipulating values, composite functions, general utilities
- **Bundle Size:** Core ~4 kB gzipped, Full ~24 kB gzipped
- **Maintenance:** ✅ Active/Feature-Complete (v4.17.23) | 61.6k stars | 35.2M+ users

### NumJs
- **Description:** JavaScript scientific computing library inspired by NumPy
- **URL:** https://github.com/nicolaspanel/numjs
- **Key Features:**
  - N-dimensional array object (NdArray)
  - Linear algebra functions
  - Fast Fourier Transform (FFT/IFFT)
  - Image processing tools
  - Array operations (slicing, striding, concatenation)
  - Universal functions (sin, cos, exp, log, etc.)
  - Convolution
- **Best Use Cases:** Scientific computing, image processing, ML preprocessing, signal processing, education
- **Bundle Size:** Minified CDN available
- **Maintenance:** ⚠️ Limited | 2.5k stars | 43 open issues

### ndarray
- **Description:** Modular multidimensional array library for JavaScript
- **URL:** https://github.com/mikolalysenko/ndarray
- **Key Features:**
  - View-based architecture (no data copying)
  - Element access (.get(), .set(), .index())
  - Slicing operations (.lo(), .hi(), .step())
  - Transformations (.transpose(), .pick())
  - Constant-time operations
  - Multiple data types support
- **Best Use Cases:** Images, audio, volume graphics, matrices, scientific computing
- **Bundle Size:** Not specified
- **Maintenance:** ⚠️ Unmaintained (2013-2016)

### Nano ID
- **Description:** Tiny, secure, URL-friendly unique string ID generator
- **URL:** https://github.com/ai/nanoid | https://zelark.github.io/nano-id-cc/
- **Key Features:**
  - 118 bytes (minified and brotlied)
  - No dependencies
  - Hardware random generator (crypto/Web Crypto API)
  - 21 symbols (vs 36 for UUID)
  - Portable (20+ language ports)
  - Secure and uniform distribution
- **Best Use Cases:** Database IDs, React keys, CLI tools, server/client ID generation, TypeScript projects
- **Bundle Size:** 118 bytes (minified + brotlied)
- **Maintenance:** ✅ Active (v5.1.6, Sep 2025) | 26.6k stars | 27.4M+ users

### Zod
- **Description:** TypeScript-first schema validation with static type inference
- **URL:** https://github.com/colinhacks/zod | https://zod.dev/
- **Key Features:**
  - Zero external dependencies
  - Works in Node.js and browsers
  - 2kb core bundle (gzipped)
  - Immutable API
  - TypeScript and plain JS support
  - JSON Schema conversion
- **Best Use Cases:** Runtime validation, static type inference, type-safe parsing, error handling, schema transformation
- **Bundle Size:** 2kb core (gzipped)
- **Maintenance:** ✅ Active (v4.3.6, Jan 2026) | 42k stars | 541 contributors

### Modernizr
- **Description:** JavaScript library for detecting HTML5 and CSS3 features
- **URL:** https://github.com/Modernizr/Modernizr
- **Key Features:**
  - Feature detection for HTML5/CSS3
  - Results as global object and <html> classes
  - Asynchronous event listeners (Modernizr.on())
  - Custom builds
  - Build tool integration (Webpack, Gulp, Parcel)
- **Best Use Cases:** Progressive enhancement, browser feature detection, conditional styling/scripts, custom builds
- **Bundle Size:** Not specified (custom builds)
- **Maintenance:** ✅ Active (v3.13.1, Aug 2024) | 25.7k stars | Note: Website outdated, use npm

---

## 12. Build Tools

### Vite
- **Description:** Next-generation frontend build tooling with instant server start
- **URL:** https://github.com/vitejs/vite | https://vite.dev/
- **Key Features:**
  - Instant server start
  - Lightning-fast HMR
  - Rich features
  - Optimized build (Rollup-based)
  - Universal plugin interface
  - Fully typed APIs
- **Best Use Cases:** Frontend development, fast HMR-enabled dev, production builds, plugin development
- **Bundle Size:** N/A (build tool)
- **Maintenance:** ✅ Highly Active (v8.3.0, Feb 2026) | 78.6k stars | 9.8M+ users

### esbuild
- **Description:** Extremely fast bundler written in Go (10-100x faster)
- **URL:** https://github.com/evanw/esbuild | https://esbuild.github.io/
- **Key Features:**
  - Extreme speed without cache
  - Built-in TypeScript, JSX, CSS support
  - CLI, JS, and Go APIs
  - ESM and CommonJS bundling
  - Tree shaking, minification, source maps
  - Local server, watch mode, plugins
- **Best Use Cases:** Fast bundling, TypeScript/JSX compilation, CSS bundling, development workflows, production builds
- **Bundle Size:** N/A (build tool)
- **Maintenance:** ✅ Active (v0.27.3, Feb 2026) | 309 releases | 121 contributors

### Rollup
- **Description:** ES module bundler for JavaScript libraries and applications
- **URL:** https://github.com/rollup/rollup | https://rollupjs.org/
- **Key Features:**
  - ES modules support
  - Tree shaking for smaller bundles
  - Multiple output formats (IIFE, CommonJS, UMD, AMD, ES)
  - CommonJS import via plugins
- **Best Use Cases:** Building JavaScript libraries, applications, legacy environment support, optimized browser bundles
- **Bundle Size:** N/A (build tool)
- **Maintenance:** ✅ Active (v4.59.0, Feb 2026) | 26.2k stars | 432 contributors

### Webpack
- **Description:** Module bundler for JavaScript and assets
- **URL:** https://github.com/webpack/webpack | https://webpack.js.org/
- **Key Features:**
  - ES Modules, CommonJS, AMD support
  - Code splitting
  - Loaders for preprocessing
  - Plugin system
  - Deduplication, minification, hashing
  - Static analysis for dependencies
- **Best Use Cases:** Front-end build tooling, asset processing, multi-format modules, code splitting, framework integration
- **Bundle Size:** N/A (build tool)
- **Maintenance:** ✅ Active (v5.105.4, Mar 2026) | 66k stars | 22.4M+ users

---

## 13. Data Visualization

### Chart.js
- **Description:** Simple yet flexible JavaScript charting library using HTML5 canvas
- **URL:** https://github.com/chartjs/Chart.js | https://www.chartjs.org/
- **Key Features:**
  - HTML5 canvas rendering
  - Flexible configuration
  - Multiple chart types
  - TypeScript support
  - Extensible architecture
- **Best Use Cases:** Interactive data visualizations, dashboards, analytics, statistical data, designer-friendly charts
- **Bundle Size:** Not specified
- **Maintenance:** ✅ Active (v4.5.1, Oct 2025) | 67.2k stars | 498 contributors

### ApexCharts.js
- **Description:** Modern SVG-based charting library with 100+ ready-to-use samples
- **URL:** https://github.com/apexcharts/apexcharts.js | https://apexcharts.com/
- **Key Features:**
  - 12+ chart types (bar, line, area, scatter, candlestick, heatmap, gauge, sparkline)
  - Interactive elements (zoom, pan, scroll, selection)
  - Dynamic updates, drill-down
  - Annotations
  - Mixed/combo charts
  - SSR support (Next.js, Nuxt, SvelteKit, Astro)
  - Tree-shaking support
- **Best Use Cases:** Dashboards, financial applications, data analysis, web applications, SSR applications, reporting tools
- **Bundle Size:** Single minified file, tree-shaking available
- **Maintenance:** ✅ Highly Active (v5.10.1, Mar 2026) | 15.1k stars | 237k+ users

### D3.js
- **Description:** (See Graphics/Rendering section) - Low-level data visualization library
- **URL:** https://github.com/d3/d3 | https://d3js.org/
- **Best Use Cases:** Custom visualizations, data journalism, interactive charts, foundation for other libraries

---

## 14. Maps/Geospatial

### Leaflet
- **Description:** (See Graphics/Rendering section) - Leading open-source interactive maps library
- **URL:** https://github.com/Leaflet/Leaflet | https://leafletjs.com/
- **Bundle Size:** ~40 kB gzipped JS, ~3.2 kB gzipped CSS
- **Best Use Cases:** Interactive maps, mobile-friendly maps, humanitarian coordination

### Mapbox GL JS
- **Description:** (See Graphics/Rendering section) - Vector maps with WebGL
- **URL:** https://github.com/mapbox/mapbox-gl-js | https://www.mapbox.com/
- **Best Use Cases:** Custom styled maps, geospatial visualization, 3D terrain, satellite imagery

---

## 15. Machine Learning

### TensorFlow.js
- **Description:** Hardware-accelerated JavaScript library for training and deploying ML models
- **URL:** https://github.com/tensorflow/tfjs | https://www.tensorflow.org/js/
- **Key Features:**
  - Browser-based ML development
  - Node.js support with native TensorFlow
  - Model conversion (TensorFlow/Keras)
  - Client-side retraining
  - Multiple backends (CPU, WebGL, WASM, WebGPU, Node.js)
  - Visualization tools (tfjs-vis)
  - AutoML support
- **Best Use Cases:** Building ML models from scratch, running pre-trained models, Node.js ML, client-side inference, visualization
- **Bundle Size:** Modular packages (tfjs-core, tfjs-layers, tfjs-data, backends)
- **Maintenance:** ✅ Active (v4.22.0, Oct 2024) | 19.1k stars | 325 contributors

### MediaPipe
- **Description:** (See Video/Media section) - On-device ML for live and streaming media
- **URL:** https://github.com/google/mediapipe | https://developers.google.com/mediapipe
- **Best Use Cases:** Computer vision, video processing, 3D perception, accessibility, creative applications

---

## Quick Reference Table

| Category | Library | Bundle Size | Maintenance | Stars |
|----------|---------|-------------|-------------|-------|
| **Audio** | Howler.js | ~7kb gzipped | ✅ Active | 25.2k |
| **Audio** | Tone.js | - | ⚠️ Outdated | 14.7k |
| **3D Engine** | Three.js | Modular | ✅ Active | 111k |
| **3D Engine** | Babylon.js | Modular | ✅ Active | 25.2k |
| **2D Engine** | Phaser | Optimizable | ✅ Active | 39.1k |
| **2D Engine** | PixiJS | Lightweight | ✅ Active | 46.7k |
| **Physics 2D** | Matter.js | - | ✅ Active | 18.1k |
| **Physics 3D** | Rapier | - | ✅ Active | 5.2k |
| **Animation** | GSAP | Ad-excluded | ✅ Active | 24k |
| **Animation** | Motion | Tiny | ✅ Active | 31.1k |
| **Animation** | Anime.js | Lightweight | ✅ Active | 66.7k |
| **Graphics** | D3.js | Modular | ✅ Active | 112k |
| **Graphics** | p5.js | - | ✅ Active | 23.5k |
| **Video** | Video.js | Minified | ✅ Active | 39.5k |
| **Video** | FFmpeg.wasm | WASM | ✅ Active | 17.2k |
| **UI** | Material UI | Modular | ✅ Active | 98k |
| **UI** | Chakra UI | - | ✅ Active | 40.3k |
| **UI** | shadcn/ui | Copy-paste | ✅ Active | 108k |
| **UI** | Bootstrap | Multiple | ✅ Active | 174k |
| **State** | Redux | 2kB | ✅ Active | 61.4k |
| **State** | Zustand | ~1kB gzipped | ✅ Active | 57.2k |
| **State** | TanStack Query | Size-limited | ✅ Active | 48.7k |
| **Networking** | Socket.IO | - | ✅ Active | 62.9k |
| **Networking** | Axios | CDN | ✅ Active | 109k |
| **Storage** | Dexie.js | Modular | ✅ Active | 14.1k |
| **Storage** | localForage | ~8.8kB gzipped | ⚠️ Limited | 25.8k |
| **Math** | glMatrix | Size-snapshot | ✅ Active | 5.7k |
| **Math** | Lodash | ~4-24kB gzipped | ✅ Active | 61.6k |
| **Math** | Nano ID | 118 bytes | ✅ Active | 26.6k |
| **Utils** | Zod | 2kb gzipped | ✅ Active | 42k |
| **Build** | Vite | N/A | ✅ Active | 78.6k |
| **Build** | esbuild | N/A | ✅ Active | - |
| **Build** | Webpack | N/A | ✅ Active | 66k |
| **Charts** | Chart.js | - | ✅ Active | 67.2k |
| **Charts** | ApexCharts | Tree-shakable | ✅ Active | 15.1k |
| **Maps** | Leaflet | ~43kB total | ✅ Active | 44.6k |
| **Maps** | Mapbox GL JS | - | ✅ Active | - |
| **ML** | TensorFlow.js | Modular | ✅ Active | 19.1k |
| **ML** | MediaPipe | - | ✅ Active | 34k |

---

## Legend

- ✅ **Active**: Regularly maintained with recent releases
- ⚠️ **Limited/Outdated**: Infrequent updates or potential maintenance concerns
- **Stars**: GitHub star count (approximate, as of early 2026)
- **Bundle Size**: Approximate size when available

---

## Notes

- Bundle sizes may vary based on build configuration and tree-shaking
- Maintenance status is based on release frequency and community activity as of early 2026
- Always check official documentation for the most current information
- Consider your specific project requirements when choosing libraries
- Many libraries offer modular imports to reduce bundle size

---

*Last updated: March 2026*
