import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
      // see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
      // process and buffer are excluded because already managed
      // by node-globals-polyfill
      util: 'node_modules/rollup-plugin-node-polyfills/polyfills/util.js',
      sys: 'util',
      events: 'node_modules/rollup-plugin-node-polyfills/polyfills/events.js',
      stream: 'node_modules/rollup-plugin-node-polyfills/polyfills/stream.js',
      path: 'node_modules/rollup-plugin-node-polyfills/polyfills/path.js',
      querystring: 'node_modules/rollup-plugin-node-polyfills/polyfills/qs.js',
      punycode: 'node_modules/rollup-plugin-node-polyfills/polyfills/punycode.js',
      url: 'node_modules/rollup-plugin-node-polyfills/polyfills/url.js',
      string_decoder:
          'node_modules/rollup-plugin-node-polyfills/polyfills/string-decoder.js',
      http: 'node_modules/rollup-plugin-node-polyfills/polyfills/http.js',
      https: 'node_modules/rollup-plugin-node-polyfills/polyfills/http.js',
      os: 'node_modules/rollup-plugin-node-polyfills/polyfills/os.js',
      assert: 'node_modules/rollup-plugin-node-polyfills/polyfills/assert.js',
      constants: 'node_modules/rollup-plugin-node-polyfills/polyfills/constants.js',
      _stream_duplex:
          'node_modules/rollup-plugin-node-polyfills/polyfills/readable-stream/duplex.js',
      _stream_passthrough:
          'node_modules/rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough.js',
      _stream_readable:
          'node_modules/rollup-plugin-node-polyfills/polyfills/readable-stream/readable.js',
      _stream_writable:
          'node_modules/rollup-plugin-node-polyfills/polyfills/readable-stream/writable.js',
      _stream_transform:
          'node_modules/rollup-plugin-node-polyfills/polyfills/readable-stream/transform.js',
      timers: 'node_modules/rollup-plugin-node-polyfills/polyfills/timers.js',
      console: 'node_modules/rollup-plugin-node-polyfills/polyfills/console.js',
      vm: 'node_modules/rollup-plugin-node-polyfills/polyfills/vm.js',
      zlib: 'node_modules/rollup-plugin-node-polyfills/polyfills/zlib.js',
      tty: 'node_modules/rollup-plugin-node-polyfills/polyfills/tty.js',
      domain: 'node_modules/rollup-plugin-node-polyfills/polyfills/domain.js',
      './runtimeConfig': './runtimeConfig.browser',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: false
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        rollupNodePolyFill()
    ]
    }
  }
})
