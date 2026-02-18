/**
 * EJS template for published site static HTML. Edit published-site-template.ejs and sync here if needed,
 * or use fs.readFileSync in Node to load the .ejs file at runtime.
 */
export const PUBLISHED_SITE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><%= meta.title %></title>
  <% if (meta.description) { %><meta name="description" content="<%= meta.description %>"><% } %>
  <% if (canonicalUrl) { %><link rel="canonical" href="<%= canonicalUrl %>"><% } %>
  <% if (meta.ogImage) { %><meta property="og:image" content="<%= meta.ogImage %>"><% } %>
  <meta property="og:title" content="<%= meta.title %>">
  <% if (meta.description) { %><meta property="og:description" content="<%= meta.description %>"><% } %>
  <% if (canonicalUrl) { %><meta property="og:url" content="<%= canonicalUrl %>"><% } %>
  <meta name="twitter:card" content="summary_large_image">
  <% if (favicon) { %><link rel="icon" href="<%= favicon %>"><% } %>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
</head>
<body class="min-h-screen bg-white text-gray-900">
  <header class="border-b p-4 flex items-center gap-3">
    <% if (logo) { %><img src="<%= logo %>" alt="" class="h-10 w-auto object-contain" /><% } %>
    <h1 class="text-xl font-semibold"><%= businessName %></h1>
  </header>
  <% if (heroImage) { %>
  <div class="w-full"><img src="<%= heroImage %>" alt="" class="h-48 w-full object-cover md:h-64" /></div>
  <% } %>
  <div class="p-6">
    <% if (shortDescription) { %><p class="text-gray-600"><%= shortDescription %></p><% } %>
    <% if (about || yearEstablished) { %>
    <section class="mt-6">
      <h2 class="text-lg font-medium">About</h2>
      <% if (yearEstablished) { %><p class="mt-2 text-sm text-gray-600"><%= yearEstablished %></p><% } %>
      <% if (about) { %><p class="mt-2 text-gray-700"><%= about %></p><% } %>
    </section>
    <% } %>
    <% if (hasContact) { %>
    <section class="mt-6">
      <h2 class="text-lg font-medium">Contact</h2>
      <ul class="mt-2 space-y-1 text-gray-700">
        <% if (address) { %><li><%= address %></li><% } %>
        <% if (country) { %><li><%= country %></li><% } %>
        <% if (areaServed) { %><li class="text-gray-600"><%= areaServed %></li><% } %>
        <% if (phone) { %><li>Phone: <%= phone %></li><% } %>
        <% if (email) { %><li>Email: <%= email %></li><% } %>
        <% if (whatsAppHref) { %><li><a href="<%= whatsAppHref %>" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">Chat on WhatsApp</a></li><% } %>
      </ul>
    </section>
    <% } %>
    <% if (hasHours) { %>
    <section class="mt-6">
      <h2 class="text-lg font-medium">Hours</h2>
      <% if (timezone) { %><p class="mt-1 text-sm text-gray-500">All times in <%= timezoneLabel %></p><% } %>
      <ul class="mt-2 space-y-1 text-gray-700">
        <% if (businessHours) { %><li><%= businessHours %></li><% } %>
        <% if (specialHours) { %><li class="text-gray-600"><%= specialHours %></li><% } %>
      </ul>
    </section>
    <% } %>
    <% if (galleryUrls && galleryUrls.length > 0) { %>
    <section class="mt-6">
      <h2 class="text-lg font-medium">Gallery</h2>
      <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <% galleryUrls.forEach(function(url) { %><img src="<%= url %>" alt="" class="aspect-square w-full rounded-lg object-cover" /><% }); %>
      </div>
    </section>
    <% } %>
    <% if (youtubeEmbeds && youtubeEmbeds.length > 0) { %>
    <section class="mt-6">
      <h2 class="text-lg font-medium">Videos</h2>
      <div class="mt-2 space-y-4">
        <% youtubeEmbeds.forEach(function(embed) { %><div class="aspect-video w-full max-w-2xl overflow-hidden rounded-lg"><iframe src="<%= embed.src %>" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="h-full w-full"></iframe></div><% }); %>
      </div>
    </section>
    <% } %>
    <section class="mt-6">
      <h2 class="text-lg font-medium">Contact us</h2>
      <form method="post" action="<%= contactFormAction %>" class="mt-2 flex flex-col gap-3 max-w-md">
        <input type="text" name="name" required placeholder="Name" class="border rounded px-3 py-2" />
        <input type="email" name="email" required placeholder="Email" class="border rounded px-3 py-2" />
        <textarea name="message" required placeholder="Message" rows="4" class="border rounded px-3 py-2"></textarea>
        <button type="submit" class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Send</button>
      </form>
    </section>
  </div>
</body>
</html>
`;
