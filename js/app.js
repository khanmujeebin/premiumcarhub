async function getInventory() {
  try {
    const res = await fetch('/data/inventory.json');
    const cars = await res.json();
    if (cars.length > 0) return cars;
  } catch(e) {}
  return [];
}
