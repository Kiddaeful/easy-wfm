// Module for "Rivens" tab
import { createAuctionCell } from './auction-cell.js';
import { generateSimilarRivenQueries, isTrashRiven } from './search-queries.js';

let knownWeapons = [];

async function loadKnownWeapons() {
  if (knownWeapons.length > 0) return;
  const knownWeaponsUnsorted = await WarframeAPI.getRivenItems();
  knownWeapons = knownWeaponsUnsorted.sort((a, b) => a.item_name.localeCompare(b.item_name));
}

/**
 * Initializes the Rivens tab content
 */
export function initRivensTab() {
  console.log('Rivens tab initialized');
  loadKnownWeapons();
  refreshRivensTab();
}

/**
 * Refreshes the Rivens tab content
 */
export async function refreshRivensTab() {
  console.log('Rivens tab refreshed');
  const container = document.getElementById('rivensTab');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding: 20px;">loading your auctions... ⏳</div>';

  try {
    const user = await window.WarframeAPI.getUserInfo();
    if (!user || !user.id) {
      container.innerHTML = '<div style="text-align:center; padding: 20px; color: red;">Erreur: Utilisateur non identifié. Veuillez vous reconnecter.</div>';
      return;
    }

    const auctions = await window.WarframeAPI.getProfileAuctions(user.slug);
    
    container.innerHTML = '';
    
    if (auctions.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">Aucune enchère en cours.</div>';
      return;
    }

    // Header with count
    const header = document.createElement('div');
    header.style.padding = '10px 10px 0 10px';
    header.style.fontWeight = 'bold';
    header.textContent = `Your auctions (${auctions.length})`;
    container.appendChild(header);

    // Filter input
    const filterContainer = document.createElement('div');
    filterContainer.style.padding = '0 10px 10px 10px';
    
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter by weapon name...';
    filterInput.className = 'form-input';
    filterInput.style.width = '100%';
    filterContainer.appendChild(filterInput);
    container.appendChild(filterContainer);

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '10px';
    list.style.padding = '10px';

    // Sort by most recent update
    auctions.sort((a, b) => new Date(b.updated) - new Date(a.updated));

    // Function to render auction cells
    const renderAuctions = (filteredAuctions) => {
        list.innerHTML = '';
        
        if (filteredAuctions.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.textAlign = 'center';
            noResults.style.padding = '20px';
            noResults.style.color = '#666';
            noResults.textContent = 'No auctions match your filter.';
            list.appendChild(noResults);
            return;
        }
        
        filteredAuctions.forEach(auction => {
            const auctionStats = (auction.item.attributes || []).map(attr => ({
                type: attr.positive ? 'positive' : 'negative',
                matchedAttribute: { url_name: attr.url_name }
            }));
            const auctionSearchData = { stats: auctionStats };
            let currentIsTrash = isTrashRiven(auctionSearchData);

            const cell = createAuctionCell(auction, [], [], null, {
                showUpdate: true,
                showWeapon: true,
                onUpdate: (a) => showUpdateView(a, currentIsTrash)
            });

            // Trash checkbox — appended into rightDiv (bottom-right of the cell)
            const trashLabel = document.createElement('label');
            trashLabel.style.display = 'flex';
            trashLabel.style.alignItems = 'center';
            trashLabel.style.justifyContent = 'flex-end';
            trashLabel.style.cursor = 'pointer';
            trashLabel.style.gap = '5px';
            trashLabel.style.fontSize = '11px';
            trashLabel.style.color = '#9ca3af';
            trashLabel.style.marginTop = '4px';

            const trashCheckbox = document.createElement('input');
            trashCheckbox.type = 'checkbox';
            trashCheckbox.checked = currentIsTrash;
            trashCheckbox.style.cursor = 'pointer';
            trashCheckbox.addEventListener('change', () => {
                currentIsTrash = trashCheckbox.checked;
            });

            const trashText = document.createElement('span');
            trashText.textContent = 'trash';

            trashLabel.appendChild(trashCheckbox);
            trashLabel.appendChild(trashText);

            // cell.lastChild is rightDiv (price + update button)
            cell.lastChild.appendChild(trashLabel);

            // Status indicator if closed or private
            if (auction.closed || auction.private || !auction.visible) {
                const statusDiv = document.createElement('div');
                statusDiv.style.fontSize = '12px';
                statusDiv.style.marginTop = '5px';
                statusDiv.style.textAlign = 'right';
                
                if (auction.closed) {
                    statusDiv.textContent = '🔴 Closed';
                    statusDiv.style.color = '#ef4444';
                } else if (!auction.visible) {
                    statusDiv.textContent = '👁️ Invisible';
                    statusDiv.style.color = '#f59e0b';
                } else if (auction.private) {
                    statusDiv.textContent = '🔒 Private';
                    statusDiv.style.color = '#6b7280';
                }
                
                if (cell.firstChild) {
                    cell.firstChild.appendChild(statusDiv);
                }
            }

            list.appendChild(cell);
        });
    };

    // Initial render
    renderAuctions(auctions);

    // Filter functionality
    filterInput.addEventListener('input', (e) => {
        const filterValue = e.target.value.toLowerCase().trim();
        
        if (!filterValue) {
            renderAuctions(auctions);
            return;
        }
        
        const filtered = auctions.filter(auction => {
            const weaponName = auction.item?.weapon_url_name || '';
            const itemName = auction.item?.name || '';
            return weaponName.toLowerCase().includes(filterValue) || 
                   itemName.toLowerCase().includes(filterValue);
        });
        
        renderAuctions(filtered);
    });

    container.appendChild(list);

  } catch (error) {
    console.error('Error refreshing rivens tab:', error);
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: red;">Erreur lors du chargement: ${error.message}</div>`;
  }
}

/**
 * Shows the update view for a specific auction
 */
async function showUpdateView(auction, isTrash = false) {
    const container = document.getElementById('rivensTab');
    container.innerHTML = ''; // Clear list

    // 1. Back Button
    const topBar = document.createElement('div');
    topBar.style.padding = '10px';
    topBar.style.display = 'flex';
    topBar.style.alignItems = 'center';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary btn-sm';
    backBtn.textContent = '← Back to list';
    backBtn.onclick = () => refreshRivensTab();
    topBar.appendChild(backBtn);
    
    container.appendChild(topBar);

    // 2. The Riven (Top)
    const rivenContainer = document.createElement('div');
    rivenContainer.style.padding = '0 10px 10px 10px';
    
    const cell = createAuctionCell(auction, [], [], null, { showUpdate: false, showWeapon: true });
    rivenContainer.appendChild(cell);
    
    // Actions (Update Price, Delete)
    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '10px';
    actionsDiv.style.marginTop = '10px';
    actionsDiv.style.justifyContent = 'flex-end';

    const updatePriceBtn = document.createElement('button');
    updatePriceBtn.className = 'btn btn-primary btn-sm';
    updatePriceBtn.textContent = 'Update Price';
    updatePriceBtn.onclick = () => openUpdatePriceModal(auction);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.backgroundColor = '#ef4444';
    deleteBtn.style.color = 'white';
    deleteBtn.onclick = () => confirmDelete(auction);

    actionsDiv.appendChild(updatePriceBtn);
    actionsDiv.appendChild(deleteBtn);
    
    rivenContainer.appendChild(actionsDiv);
    container.appendChild(rivenContainer);

    // 3. Similar Rivens
    const similarContainer = document.createElement('div');
    similarContainer.id = 'similarRivensUpdateContainer';
    similarContainer.style.padding = '10px';
    similarContainer.style.borderTop = '1px solid #eee';
    similarContainer.innerHTML = '<div class="auction-loader"><div class="auction-loader__spinner"></div><span class="auction-loader__text">Loading similar auctions...</span></div>';
    container.appendChild(similarContainer);

    // Perform search
    await loadKnownWeapons(); // Ensure loaded

    // Transform auction data to format expected by generateSimilarRivenQueries
    const searchData = {
        weaponName: auction.item.weapon_url_name,
        rolls: auction.item.re_rolls,
        isTrash: isTrash,
        stats: auction.item.attributes.map(attr => ({
            type: attr.positive ? 'positive' : 'negative',
            matchedAttribute: { url_name: attr.url_name }
        }))
    };

    findSimilarRivensForUpdate(searchData, similarContainer, auction);
}

function openUpdatePriceModal(auction) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '300px';
    
    const title = document.createElement('h3');
    title.textContent = 'Update Price';
    content.appendChild(title);
    
    const form = document.createElement('form');
    form.onsubmit = (e) => e.preventDefault();
    
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const label = document.createElement('label');
    label.textContent = 'New Price (Platinum)';
    group.appendChild(label);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-input';
    input.value = auction.buyout_price || auction.starting_price;
    input.min = 1;
    input.required = true;
    input.focus();
    group.appendChild(input);
    
    form.appendChild(group);
    
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '10px';
    btnGroup.style.marginTop = '20px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.flex = '1';
    cancelBtn.onclick = () => overlay.remove();
    
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Validate';
    saveBtn.style.flex = '1';
    
    saveBtn.onclick = async () => {
        const newPrice = parseInt(input.value);
        if (!newPrice || newPrice <= 0) return;
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        const payload = {
            starting_price: newPrice,
            buyout_price: newPrice,
            minimal_reputation: auction.minimal_reputation || 0,
            visible: auction.visible,
            note: auction.note || ""
        };
        
        const result = await WarframeAPI.updateAuction(auction.id, payload);
        
        if (result.success) {
            overlay.remove();
            refreshRivensTab(); // Go back to list
        } else {
            alert('Error updating auction: ' + result.error);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Validate';
        }
    };
    
    btnGroup.appendChild(cancelBtn);
    btnGroup.appendChild(saveBtn);
    form.appendChild(btnGroup);
    
    content.appendChild(form);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

function confirmDelete(auction) {
    if (confirm('Are you sure you want to close this auction?')) {
        WarframeAPI.closeAuction(auction.id).then(result => {
            if (result.success) {
                refreshRivensTab();
            } else {
                alert('Error closing auction: ' + result.error);
            }
        });
    }
}

// --- Search Logic (Duplicated/Adapted from new-tab.js) ---

async function findSimilarRivensForUpdate(data, container, originalAuction) {
  const queries = generateSimilarRivenQueries(data, knownWeapons);
  
  if (queries.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">No similar rivens found (insufficient data).</div>';
    return;
  }

  const allResults = [];
  let successfulQueriesCount = 0;
  const BATCH_SIZE = 3;

  try {
    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      if (successfulQueriesCount >= 3) break;

      const batch = queries.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(async (q) => {
        try {
          const auctions = await WarframeAPI.searchAuctions(q);
          return { query: q, auctions };
        } catch (err) {
          return { query: q, auctions: [] };
        }
      }));

      for (const res of batchResults) {
        allResults.push(res);
        if (res.auctions && res.auctions.length > 0) {
          successfulQueriesCount++;
        }
      }

      if (successfulQueriesCount < 3 && (i + BATCH_SIZE) < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    renderSimilarRivensForUpdate(allResults, container, originalAuction);

  } catch (err) {
    console.error("Error fetching similar rivens", err);
    if (allResults.length > 0) {
        renderSimilarRivensForUpdate(allResults, container, originalAuction);
    } else {
        container.innerHTML = '<div style="text-align:center; padding: 20px; color: red;">Error loading similar rivens.</div>';
    }
  }
}

function renderSimilarRivensForUpdate(results, container, originalAuction) {
  container.innerHTML = '';
  
  const title = document.createElement('h3');
  title.textContent = 'Similar Rivens on Market';
  container.appendChild(title);

  // Extract original attributes for highlighting
  console.log('auction attributes', originalAuction.item.attributes);
  const originalPositiveAttrs = originalAuction.item.attributes
    .filter(s => s.positive === true)
    .map(s => s.url_name);

  const originalNegativeAttrs = originalAuction.item.attributes
    .filter(s => s.positive === false)
    .map(s => s.url_name);

  console.log('original positive attrs', originalPositiveAttrs);
  console.log('original negative attrs', originalNegativeAttrs);

  results.forEach(res => {
      // Skip empty results if we have others
      if (res.auctions.length === 0 && results.some(r => r.auctions.length > 0)) return;

      const count = res.auctions.length - res.auctions.filter(a => a.id === originalAuction.id).length;

      const section = document.createElement('div');
      section.style.marginBottom = '24px';
      
      const sectionTitle = document.createElement('h4');
      sectionTitle.textContent = `${res.query._label} (${count} results)`;
      sectionTitle.style.color = '#667eea';
      sectionTitle.style.marginBottom = '8px';
      section.appendChild(sectionTitle);

      if (res.auctions.length > 0) {
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '8px';
        
        res.auctions.slice(0, 5).forEach(auction => {
            // Don't show our own auction in results
            if (auction.id === originalAuction.id) return;
            
            list.appendChild(createAuctionCell(auction, originalPositiveAttrs, originalNegativeAttrs, res.query));
        });
        
        section.appendChild(list);
      } else {
        const noRes = document.createElement('div');
        noRes.textContent = 'No auctions found.';
        noRes.style.color = '#999';
        noRes.style.fontStyle = 'italic';
        section.appendChild(noRes);
      }
      
      container.appendChild(section);
  });
}
