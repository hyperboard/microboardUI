Bun.serve({
  port: 8000,
  fetch(request) {
    const { pathname } = new URL(request.url);

    // map “/” ⇒ “/index.html”, otherwise use the path directly
    const asset = pathname === "/" ? "/index.html" : pathname;
    const filePath = `./public${asset}`;

    try {
      return new Response(Bun.file(filePath));
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },
});

console.log("➜ http://localhost:8000/")