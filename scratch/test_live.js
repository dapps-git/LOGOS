async function checkLive() {
  const html = await fetch('https://logos-2nkc.vercel.app').then(r => r.text());
  const jsFiles = (html.match(/\/static\/[a-zA-Z0-9_\-\.\/]+\.js/g) || []);
  console.log('Found JS files count:', jsFiles.length);
  for (const js of jsFiles.slice(0, 10)) {
    const text = await fetch('https://logos-2nkc.vercel.app/_next' + js).then(r => r.text());
    if (text.includes('tweaki.pw')) console.log('Contains tweaki.pw:', js);
    if (text.includes('localhost:5001')) console.log('Contains localhost:5001:', js);
    if (text.includes('/cart/add')) console.log('Contains /cart/add:', js);
  }
}
checkLive().catch(console.error);
