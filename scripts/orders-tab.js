// Module for "Orders" tab

// Cache for orders in memory
let ordersCache = null;

// Stay Updated task state
let stayUpdatedActive = false;
let stayUpdatedLoopRunning = false;

/**
 * Continuously refreshes all orders by PATCHing each one with its current platinum price.
 * Loops until stayUpdatedActive is set to false.
 */
async function runStayUpdatedLoop() {
  if (stayUpdatedLoopRunning) return;
  stayUpdatedLoopRunning = true;

  while (stayUpdatedActive) {
    if (!ordersCache || ordersCache.length === 0) break;

    for (const order of ordersCache) {
      if (!stayUpdatedActive) break;
      try {
        await window.WarframeAPI.updateOrder(order.id, order.platinum, 'stay-updated');
      } catch (err) {
        if (err.message !== 'Cancelled') {
          console.error('Stay Updated: error refreshing order', order.id, err);
        }
      }
    }
  }

  stayUpdatedLoopRunning = false;
}

/**
 * Stops the Stay Updated task and removes queued calls
 */
function stopStayUpdated() {
  stayUpdatedActive = false;
  window.WarframeAPI.v2Queue.removeByTag('stay-updated');
}

/**
 * Initializes the Orders tab
 */
export function initOrdersTab() {
  console.log('Orders tab initialized');
}

/**
 * Refreshes the Orders tab content
 * @param {boolean} forceRefresh - If true, forces a reload from API even if cache exists
 */
export async function refreshOrdersTab(forceRefresh = false) {
  const container = document.getElementById('ordersTab');
  if (!container) return;

  // Use cache if available and not forcing refresh
  if (!forceRefresh && ordersCache) {
    console.log('Using cached orders');
    renderOrders(container, ordersCache);
    return;
  }

  container.innerHTML = '<div style="text-align:center; padding: 20px;">Loading your orders... ⏳</div>';

  try {
    const orders = await window.WarframeAPI.getUserOrders();
    
    // Store in cache
    ordersCache = orders;
    
    renderOrders(container, orders);

  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: red;">Error loading orders: ${error.message}</div>`;
  }
}

/**
 * Renders the orders list
 */
function renderOrders(container, orders) {
  container.innerHTML = '';
  
  if (orders.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">No active orders.</div>';
    return;
  }

  // Filter input (at the very top)
  const filterContainer = document.createElement('div');
  filterContainer.style.padding = '10px 10px 0 10px';
  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.placeholder = 'Filter by item name...';
  filterInput.className = 'form-control form-control-sm';
  filterContainer.appendChild(filterInput);
  container.appendChild(filterContainer);

  // Header with refresh button
  const headerContainer = document.createElement('div');
  headerContainer.style.display = 'flex';
  headerContainer.style.justifyContent = 'space-between';
  headerContainer.style.alignItems = 'center';
  headerContainer.style.padding = '10px 10px 0 10px';
  
  const header = document.createElement('div');
  header.style.fontWeight = 'bold';
  header.textContent = `Your orders (${orders.length})`;
  headerContainer.appendChild(header);

  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'btn btn-secondary btn-sm';
  refreshBtn.innerHTML = '🔄 Refresh';
  refreshBtn.style.fontSize = '12px';
  refreshBtn.onclick = () => refreshOrdersTab(true);
  headerContainer.appendChild(refreshBtn);

  const stayUpdatedBtn = document.createElement('button');
  stayUpdatedBtn.className = stayUpdatedActive ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
  stayUpdatedBtn.style.fontSize = '12px';
  stayUpdatedBtn.style.marginLeft = '6px';

  function updateStayUpdatedBtn() {
    if (stayUpdatedActive) {
      stayUpdatedBtn.innerHTML = '⟳ Stay Updated';
      stayUpdatedBtn.className = 'btn btn-primary btn-sm';
    } else {
      stayUpdatedBtn.innerHTML = 'Stay Updated';
      stayUpdatedBtn.className = 'btn btn-secondary btn-sm';
    }
  }

  updateStayUpdatedBtn();

  stayUpdatedBtn.onclick = () => {
    if (stayUpdatedActive) {
      stopStayUpdated();
      updateStayUpdatedBtn();
    } else {
      stayUpdatedActive = true;
      updateStayUpdatedBtn();
      runStayUpdatedLoop();
    }
  };
  headerContainer.appendChild(stayUpdatedBtn);
  
  container.appendChild(headerContainer);

  // Orders list
  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '10px';
  list.style.padding = '10px';
  container.appendChild(list);

  filterInput.oninput = () => {
    const query = filterInput.value.trim().toLowerCase();
    for (const orderCard of list.querySelectorAll('.order-card')) {
      const nameEn = orderCard.dataset.nameEn || '';
      const nameLang = orderCard.dataset.nameLang || '';
      const isLoaded = orderCard.dataset.loaded === 'true';
      const matches = !query || !isLoaded || nameEn.includes(query) || nameLang.includes(query);
      orderCard.style.display = matches ? '' : 'none';
    }
  };

  // Create cards immediately with loading state, then load data asynchronously
  for (const order of orders) {
    const orderCard = createOrderCardSkeleton(order);
    list.appendChild(orderCard);
    
    // Load card data asynchronously (don't await)
    loadOrderCardData(orderCard, order);
  }
}

/**
 * Creates an order card skeleton with loading state
 */
function createOrderCardSkeleton(order) {
  const card = document.createElement('div');
  card.className = 'order-card';
  card.style.border = '1px solid #e5e7eb';
  card.style.borderRadius = '8px';
  card.style.padding = '12px';
  card.style.backgroundColor = 'white';

  // Item name (loading)
  const nameDiv = document.createElement('div');
  nameDiv.className = 'order-card-name';
  nameDiv.style.fontWeight = 'bold';
  nameDiv.style.fontSize = '16px';
  nameDiv.style.marginBottom = '8px';
  nameDiv.style.color = '#999';
  nameDiv.innerHTML = '⏳ Loading item...';
  card.appendChild(nameDiv);

  // First line: Your price / Minimum price
  const priceLineDiv = document.createElement('div');
  priceLineDiv.style.display = 'grid';
  priceLineDiv.style.gridTemplateColumns = '1fr 1fr';
  priceLineDiv.style.gap = '8px';
  priceLineDiv.style.fontSize = '14px';
  priceLineDiv.style.marginBottom = '8px';

  // Your price
  const priceLabel = document.createElement('div');
  priceLabel.style.color = '#666';
  priceLabel.textContent = 'Your price:';
  const priceValue = document.createElement('div');
  priceValue.className = 'order-card-your-price';
  priceValue.textContent = `${order.platinum} 💎`;
  priceValue.style.fontWeight = 'bold';

  // Min market price (loading)
  const minPriceLabel = document.createElement('div');
  minPriceLabel.style.color = '#666';
  minPriceLabel.textContent = 'Market min:';
  const minPriceValue = document.createElement('div');
  minPriceValue.className = 'order-card-min-price';
  minPriceValue.style.color = '#999';
  minPriceValue.innerHTML = '⏳ Loading...';

  priceLineDiv.appendChild(priceLabel);
  priceLineDiv.appendChild(minPriceLabel);
  priceLineDiv.appendChild(priceValue);
  priceLineDiv.appendChild(minPriceValue);
  card.appendChild(priceLineDiv);

  // Second line: Rank / Type
  const infoLineDiv = document.createElement('div');
  infoLineDiv.style.display = 'grid';
  infoLineDiv.style.gridTemplateColumns = '1fr 1fr';
  infoLineDiv.style.gap = '8px';
  infoLineDiv.style.fontSize = '14px';

  // Rank
  const rankLabel = document.createElement('div');
  rankLabel.style.color = '#666';
  rankLabel.textContent = 'Rank:';
  const rankValue = document.createElement('div');
  rankValue.textContent = order.rank !== undefined ? order.rank : 'N/A';

  // Type
  const typeLabel = document.createElement('div');
  typeLabel.style.color = '#666';
  typeLabel.textContent = 'Type:';
  const typeValue = document.createElement('div');
  typeValue.textContent = order.type.toUpperCase();
  typeValue.style.color = order.type === 'sell' ? '#10b981' : '#3b82f6';

  infoLineDiv.appendChild(rankLabel);
  infoLineDiv.appendChild(typeLabel);
  infoLineDiv.appendChild(rankValue);
  infoLineDiv.appendChild(typeValue);
  card.appendChild(infoLineDiv);

  // Set to min button (disabled until min price is loaded)
  const setToMinBtn = document.createElement('button');
  setToMinBtn.className = 'btn btn-secondary btn-sm order-card-set-to-min';
  setToMinBtn.style.marginTop = '10px';
  setToMinBtn.style.fontSize = '12px';
  setToMinBtn.style.width = '100%';
  setToMinBtn.textContent = 'Set to min';
  setToMinBtn.disabled = true;
  card.appendChild(setToMinBtn);

  return card;
}

/**
 * Loads data for an order card asynchronously
 */
async function loadOrderCardData(card, order) {
  const nameDiv = card.querySelector('.order-card-name');
  const minPriceDiv = card.querySelector('.order-card-min-price');
  const yourPriceDiv = card.querySelector('.order-card-your-price');
  const setToMinBtn = card.querySelector('.order-card-set-to-min');

  try {
    // Load item name
    try {
      const [itemData, language] = await Promise.all([
        window.WarframeAPI.getItemBySlug(order.itemId),
        window.WarframeAPI.getLanguage()
      ]);
      console.log('Item data:', itemData);
      const i18n = itemData.data?.i18n;
      const localName = i18n?.[language]?.name;
      const enName = i18n?.en?.name || 'Unknown Item';
      const displayName = localName || enName;

      nameDiv.innerHTML = '';
      nameDiv.style.color = '';

      const mainSpan = document.createElement('span');
      mainSpan.textContent = language !== 'en' ? `${language.toUpperCase()}: ${displayName}` : displayName;
      nameDiv.appendChild(mainSpan);

      if (language !== 'en') {
        const enDiv = document.createElement('div');
        enDiv.textContent = `EN: ${enName}`;
        enDiv.style.fontSize = '11px';
        enDiv.style.fontWeight = 'normal';
        enDiv.style.color = '#888';
        enDiv.style.marginTop = '2px';
        nameDiv.appendChild(enDiv);
      }

      card.dataset.nameEn = enName.toLowerCase();
      card.dataset.nameLang = displayName.toLowerCase();
      card.dataset.loaded = 'true';
    } catch (error) {
      console.error('Error loading item name:', error);
      nameDiv.textContent = `Item ${order.itemId}`;
      nameDiv.style.color = '#ef4444';
      card.dataset.loaded = 'true';
    }

    // Load minimum price
    try {
      const itemOrders = await window.WarframeAPI.getItemOrders(order.itemId);
      const minPrice = findMinimumPrice(itemOrders.data, order.type);

      if (minPrice !== null) {
        minPriceDiv.textContent = `${minPrice} 💎`;
        // Highlight if user's price is competitive
        if (order.type === 'sell' && order.platinum <= minPrice) {
          minPriceDiv.style.color = '#10b981'; // Green = competitive
        } else if (order.type === 'buy' && order.platinum >= minPrice) {
          minPriceDiv.style.color = '#10b981';
        } else {
          minPriceDiv.style.color = '#ef4444'; // Red = not competitive
        }

        // Enable "Set to min" button
        setToMinBtn.disabled = false;
        setToMinBtn.onclick = async () => {
          setToMinBtn.disabled = true;
          setToMinBtn.textContent = '⏳ Updating...';
          try {
            await window.WarframeAPI.updateOrder(order.id, minPrice, 'set-to-min');
            order.platinum = minPrice;
            yourPriceDiv.textContent = `${minPrice} 💎`;
            minPriceDiv.style.color = '#10b981';
            setToMinBtn.textContent = 'Set to min';
            setToMinBtn.disabled = false;
          } catch (err) {
            console.error('Error setting to min price:', err);
            setToMinBtn.textContent = 'Error — retry';
            setToMinBtn.disabled = false;
          }
        };
      } else {
        minPriceDiv.textContent = 'N/A';
        minPriceDiv.style.color = '#999';
      }
    } catch (error) {
      console.error('Error loading minimum price:', error);
      minPriceDiv.textContent = 'Error';
      minPriceDiv.style.color = '#ef4444';
    }

  } catch (error) {
    console.error('Error loading order card data:', error);
  }
}

/**
 * Finds minimum price from order data
 */
function findMinimumPrice(orders, orderType) {
  if (!orders || orders.length === 0) return null;

  // Filter by same type (sell orders if user is selling, buy orders if user is buying)
  const relevantOrders = orders.filter(
    o => o.type === orderType && o.visible && o.user.status === 'ingame'
  );
  
  if (relevantOrders.length === 0) return null;

  // Find minimum platinum price
  const prices = relevantOrders.map(o => o.platinum);
  return Math.min(...prices);
}
