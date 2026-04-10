// Service worker pour l'extension Riven reader

// Ouvrir le sidepanel quand on clique sur l'icône de l'extension
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Gestion de l'installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Easy WF Market extension installée avec succès');
});

// Écouter les messages du sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    // Logique pour récupérer des données
    sendResponse({ success: true, data: 'Données du marché Riven' });
  }
  return true;
});
