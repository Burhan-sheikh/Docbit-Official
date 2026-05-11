import React from 'react';

export const TOOL_SEO_CONTENT = {
  merge: (
    <>
      <h2 className="text-4xl font-black mb-8">Professional Grade PDF Merging: Secure, Fast, and Private</h2>
      <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
        In the modern digital landscape, the ability to consolidate multiple documents into a single, cohesive file is a fundamental requirement for efficient workflows. Whether you're a legal professional preparing a case file, a student organizing research materials, or a business owner managing invoices, DocBit's **Merge PDF** tool delivers institutional-grade performance with a critical advantage: absolute privacy.
      </p>
      
      <div className="my-12 p-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
        <h3 className="text-2xl font-black mb-4 relative z-10">Why DocBit Leads in Document Security</h3>
        <p className="text-blue-100 font-medium relative z-10 leading-relaxed">
          Standard online PDF converters require you to upload sensitive files to their cloud infrastructure. This creates a permanent digital footprint and exposes your data to potential breaches. DocBit utilizes **Client-Side Edge Computing** to process your files entirely within your browser's secure sandbox. Your data never leaves your device.
        </p>
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Advanced Local Processing Technology</h3>
      <p className="mb-6">
        DocBit is built on a high-performance WebAssembly (WASM) engine. When you add files to our platform, our local algorithm reads the binary structure of each PDF, identifies page boundaries, and streams them into a new document container in memory. This eliminates the "upload-wait" cycle common in legacy tools, providing near-instantaneous output even for large, complex documents.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
          <h4 className="font-black mb-4 uppercase text-xs tracking-widest text-blue-600">Cross-Platform Compatibility</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Our engine is optimized for all modern environments. Whether you are on macOS, Windows, Linux, iOS, or Android, you get the same bit-perfect merging results without installing heavy software.
          </p>
        </div>
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
          <h4 className="font-black mb-4 uppercase text-xs tracking-widest text-blue-600">Metadata Integrity</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Unlike basic tools that "flatten" your documents, DocBit maintains the integrity of internal links, bookmarks, and structural metadata within your merged files, ensuring professional results every time.
          </p>
        </div>
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Optimizing Your Document Workflow</h3>
      <p className="mb-8">
        Efficiency is at the heart of the DocBit experience. Beyond simple merging, our tool allows you to visually reorder files with a drag-and-drop interface, ensuring the exact sequence you need for your final report or submission. With options for smart normalization, you can force all merged pages to a standard size (like A4 or Letter), creating a uniform look for disparate sources.
      </p>
      
      <p className="mb-12 text-sm font-bold text-neutral-400 dark:text-neutral-500 italic">
        DocBit: Powering the next generation of private, high-performance document utilities.
      </p>
    </>
  ),
  split: (
    <>
      <h2 className="text-4xl font-black mb-8">Precision PDF Splitting and Extraction Engine</h2>
      <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
        Managing large PDF documents often requires surgical precision. Extracting a specific contract clause, separating monthly invoices from a year-end report, or dividing a massive digital book into digestible chapters should be a seamless, high-speed task. DocBit's **Split PDF** utility is engineered to provide granular control over document structure with zero server-side exposure.
      </p>
      
      <div className="my-12 p-10 bg-neutral-900 rounded-[40px] text-white shadow-2xl shadow-black/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
        <h3 className="text-2xl font-black mb-4 text-blue-500">Secure Range Extraction</h3>
        <p className="text-neutral-400 font-medium leading-relaxed">
          Proprietary data, medical records, and legal briefs require the highest tier of security. By splitting files locally, DocBit ensures your sensitive content remains in a "Private Loop"—processed by your CPU and stored in your RAM, never touching a cloud server or a third-party database.
        </p>
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Sophisticated Slicing Modes</h3>
      <p className="mb-8">
        We understand that "splitting" means different things to different users. Our engine offers three distinct operational modes to match your specific requirements:
      </p>
      
      <ul className="space-y-6 mb-12">
        <li className="flex gap-4">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
          <div>
            <h4 className="font-black text-neutral-900 dark:text-white uppercase text-sm tracking-widest mb-1">Split by Range</h4>
            <p className="text-sm text-neutral-500 font-medium">Extract specific sequences for focused reading or pinpoint sharing.</p>
          </div>
        </li>
        <li className="flex gap-4">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</div>
          <div>
            <h4 className="font-black text-neutral-900 dark:text-white uppercase text-sm tracking-widest mb-1">Fixed Intervals</h4>
            <p className="text-sm text-neutral-500 font-medium">Automatically divide a long document into files of a specific page count.</p>
          </div>
        </li>
        <li className="flex gap-4">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</div>
          <div>
            <h4 className="font-black text-neutral-900 dark:text-white uppercase text-sm tracking-widest mb-1">Extract All Pages</h4>
            <p className="text-sm text-neutral-500 font-medium">Instantly convert a PDF into individual single-page documents.</p>
          </div>
        </li>
      </ul>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">The Technical Advantage of WASM</h3>
      <p className="mb-12">
        DocBit leverages WebAssembly to perform bit-level manipulation of your PDF documents. This allows for near-native performance, meaning even a 500MB document can be parsed and split in seconds. Because the heavy lifting happens local-to-user, you bypass the bandwidth bottlenecks that plague traditional online tools.
      </p>
    </>
  ),
  grayscalePdf: (
    <>
      <h2 className="text-4xl font-black mb-8">Institutional-Grade PDF to Grayscale Conversion</h2>
      <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
        Converting color PDFs to grayscale is more than just a stylistic choice; it's a strategic workflow optimization. From significant printer ink savings to professional archival standards, DocBit's **Grayscale PDF** tool provides a sophisticated tonality-mapping engine that operates entirely within your browser environment.
      </p>
      
      <div className="my-12 p-1 bg-linear-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 rounded-[40px]">
        <div className="p-10 bg-white dark:bg-neutral-950 rounded-[39px]">
           <h3 className="text-2xl font-black mb-4 text-neutral-900 dark:text-white uppercase tracking-tighter">Engineered for Tonal Accuracy</h3>
           <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
             Our conversion algorithm uses weighted luminance calculations (Red: 0.299, Green: 0.587, Blue: 0.114) to transform color data into gray values. This ensures that text remains sharp and images retain their structural depth, avoiding the "washed-out" look of standard converters.
           </p>
        </div>
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">The Economics of Grayscale Optimization</h3>
      <p className="mb-8">
        For organizations managing high-volume print queues, color ink is one of the most expensive office assets. By standardizing internal documents to grayscale through DocBit, you can reduce total ink coverage (TIC) and operational costs dramatically. Furthermore, grayscale documents often yield smaller file sizes, making them more efficient for long-term cloud storage and email sharing.
      </p>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Sovereign Data Processing</h3>
      <p className="mb-12">
        In sectors like healthcare, law, and finance, document privacy is not negotiable. DocBit removes the security risk intrinsic to cloud converters. Your files are processed in a dedicated memory stack within your browser, ensuring that sensitive data is never transmitted to an external server. Once your session ends, the transient data is purged, leaving no footprint.
      </p>

      <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-dashed border-blue-200 dark:border-blue-800">
        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-600 mb-2">Technical Feature</h4>
        <p className="text-sm font-bold text-neutral-900 dark:text-white leading-relaxed">
          High-contrast thresholding mode for monochrome blueprints and technical drawings, ensuring perfect legibility for blueprints and CAD exports.
        </p>
      </div>
    </>
  ),
  imgToPdf: (
    <>
      <h2 className="text-4xl font-black mb-8">Secure Image to PDF Conversion: Browser-Native Excellence</h2>
      <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
        Transforming visual assets into professional PDF documents requires a tool that balances layout flexibility with uncompromising speed. DocBit's **Image to PDF** utility converts JPG, PNG, and WebP files into structured documents locally, providing a high-performance alternative to insecure cloud-based upload sites.
      </p>
      
      <div className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Layout Control", desc: "Choose from A4, Letter, or Fit-to-Image modes." },
          { title: "Smart Batches", desc: "Process hundreds of images in a single local session." },
          { title: "Privacy Lock", desc: "Your photos never leave your device storage." }
        ].map((feat, i) => (
          <div key={i} className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-600 mb-2">{feat.title}</h4>
            <p className="text-xs text-neutral-500 font-bold leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Desktop-Class Formatting Engine</h3>
      <p className="mb-8 font-medium">
        Control every aspect of your PDF output with professional precision:
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {['Custom Margins', 'Auto-Orientation', 'Drag-and-Drop Sequencing', 'Lossless Image Embedding', 'Page Resizing', 'Metadata Removal'].map((item, i) => (
          <li key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            <span className="text-xs font-black uppercase text-neutral-800 dark:text-neutral-300 tracking-tight">{item}</span>
          </li>
        ))}
      </ul>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Bypassing the Upload Bottleneck</h3>
      <p className="mb-12">
        Uploading gigabytes of high-resolution photos to a server is time-consuming and risks data exposure. DocBit's local processing model utilizes your device's internal power to generate PDFs on-the-fly. This makes it the ideal tool for field professionals, students scanning lecture notes, and designers consolidating portfolios on the go.
      </p>
    </>
  ),
  pdfToImg: (
    <>
      <h2 className="text-4xl font-black mb-8">High-Fidelity PDF to Image Extraction</h2>
      <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
        Rerendering PDF documents into high-resolution images is a common requirement for digital marketing, social media distribution, and presentation management. DocBit's **PDF to Image** converter delivers bit-perfect extraction into JPG or PNG formats, handled entirely within your private browser environment.
      </p>

      <div className="my-12 p-10 bg-blue-600 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
        <h3 className="text-2xl font-black mb-6 relative z-10">Modern Rendering Logic</h3>
        <p className="text-blue-100 font-medium leading-relaxed relative z-10 max-w-2xl">
          We utilize the browser's native Canvas and WebAssembly capabilities to rasterize PDF vectors into image data at up to 300 DPI. This ensures that every font, gradient, and vector path is captured with total fidelity for your digital output.
        </p>
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Professional Use Cases</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-4">
          <h4 className="font-black text-neutral-900 dark:text-white uppercase text-xs tracking-widest">Marketing & Social</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">Easily convert specific PDF slides into high-quality Instagram posts or LinkedIn graphics without specialized design software.</p>
        </div>
        <div className="space-y-4">
          <h4 className="font-black text-neutral-900 dark:text-white uppercase text-xs tracking-widest">Asset Management</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">Extract visual assets from locked documents for inclusion in dynamic web environments or presentations.</p>
        </div>
      </div>

      <h3 className="text-3xl font-black mt-16 mb-6 tracking-tight">Security in Every Pixel</h3>
      <p className="mb-12">
        Online PDF converters often store rendered images in their temporary cache, creating a massive security vulnerability for sensitive documents. DocBit's **Local-First** mandate means your rendered images exist only in your browser's memory. When you download your ZIP file, you are receiving data generated on your own hardware. Your privacy is protected by the architecture itself.
      </p>
    </>
  )
};

