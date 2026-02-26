// Module API pour Warframe Market (API v1 - Simple Login)

const API_BASE_URL = 'https://api.warframe.market/v1';
const API_V2_BASE_URL = 'https://api.warframe.market/v2';

// Request Queue System
class RequestQueue {
  constructor(maxRequestsPerSecond = 3) {
    this.queue = [];
    this.maxRPS = maxRequestsPerSecond;
    this.lastRequestTime = 0;
    this.processing = false;
  }

  async add(requestFn, tag = null) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject, tag });
      this.process();
    });
  }

  removeByTag(tag) {
    const toRemove = this.queue.filter(item => item.tag === tag);
    this.queue = this.queue.filter(item => item.tag !== tag);
    toRemove.forEach(({ reject }) => reject(new Error('Cancelled')));
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minDelay = 1000 / this.maxRPS;
      
      if (timeSinceLastRequest < minDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, minDelay - timeSinceLastRequest)
        );
      }

      // Queue may have been emptied by removeByTag during the await above
      if (this.queue.length === 0) break;

      const { requestFn, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue(3);

/**
 * Checks for rate limiting and displays a toast if necessary
 * @param {Response} response - The fetch response object
 */
function checkRateLimit(response) {
  if (response.status === 429) {
    console.warn('API Rate Limited (429)');
    if (typeof window.showToast === 'function') {
      window.showToast('We are being rate limited.', 'error');
    }
  }
}

/**
 * Retrieves the selected language from storage (defaults to 'en')
 * @returns {Promise<string>} Language code
 */
async function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      resolve(result.language || 'en');
    });
  });
}

/**
 * Saves the selected language to storage
 * @param {string} lang - Language code
 */
async function setLanguage(lang) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ language: lang }, resolve);
  });
}

/**
 * Génère ou récupère un deviceId unique
 */
async function getDeviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['deviceId'], (result) => {
      if (result.deviceId) {
        resolve(result.deviceId);
      } else {
        // Générer un nouveau deviceId unique
        const newDeviceId = `chrome-ext-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        chrome.storage.local.set({ deviceId: newDeviceId }, () => {
          resolve(newDeviceId);
        });
      }
    });
  });
}

/**
 * Connexion simple avec email et mot de passe (API v1)
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} Résultat de la connexion
 */
async function signIn(email, password) {
  try {
    console.log('Connexion avec email/password...');
    
    const deviceId = await getDeviceId();
    
    // Utiliser credentials: 'omit' pour éviter d'envoyer les cookies et le check CSRF
    // auth_type: 'header' signifie qu'on veut un token JWT, pas de session cookie
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Platform': 'chrome_extension',
        'Authorization': 'JWT'
      },
      body: JSON.stringify({
        auth_type: 'header',
        email: email,
        password: password,
        device_id: deviceId
      })
    });
    
    console.log('Réponse signin:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });
    
    const responseText = await response.text();
    console.log('Corps de la réponse (premiers 200 caractères):', responseText.substring(0, 200));
    
    checkRateLimit(response);

    if (!response.ok) {
      console.error('Erreur lors de la connexion:', response.status, responseText);
      let errorMessage = 'Erreur lors de la connexion';
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error.email) {
          errorMessage = errorData.error.email[0];
        } else {
          errorMessage = errorData.error.password[0];
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
      console.log('Error message:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Parser la réponse
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Texte complet de la réponse:', responseText);
      throw new Error(`Réponse invalide du serveur: ${parseError.message}`);
    }
    
    // Récupérer le token du header Authorization
    const authToken = response.headers.get('Authorization');
    console.log('Token reçu dans header:', authToken ? 'Oui' : 'Non');
    
    if (!authToken) {
      throw new Error('Token d\'authentification non reçu');
    }
    
    // Les données utilisateur sont dans data.payload
    const user = data.payload.user;
    
    // Sauvegarder le token et les informations utilisateur
    await saveAuthData(authToken, user);
    
    console.log('Connexion réussie !', user);
    
    return {
      success: true,
      data: {
        token: authToken,
        user: user
      }
    };
    
  } catch (error) {
    
    return {
      success: false,
      error: error
    };
  }
}



/**
 * Sauvegarde les données d'authentification
 */
async function saveAuthData(authToken, user) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      authToken: authToken,
      user: user,
      isAuthenticated: true,
      authDate: new Date().toISOString()
    }, () => {
      console.log('Données d\'authentification sauvegardées');
      resolve();
    });
  });
}


/**
 * Vérifie si l'utilisateur est connecté
 */
async function isAuthenticated() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isAuthenticated', 'authToken'], (result) => {
      resolve(result.isAuthenticated && !!result.authToken);
    });
  });
}

/**
 * Récupère le token d'authentification
 */
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

/**
 * Déconnecte l'utilisateur
 */
async function signOut() {
  return new Promise((resolve) => {
    chrome.storage.local.remove([
      'authToken',
      'user',
      'isAuthenticated',
      'authDate'
    ], () => {
      console.log('Déconnexion effectuée');
      resolve();
    });
  });
}

/**
 * Effectue une requête API authentifiée
 * @param {string} endpoint - Endpoint de l'API
 * @param {Object} options - Options de la requête fetch
 * @param {string} baseUrl - Base URL de l'API (par défaut API_BASE_URL)
 */
async function authenticatedRequest(endpoint, options = {}, baseUrl = API_BASE_URL) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Non authentifié');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': (baseUrl == API_V2_BASE_URL ? token.replace('JWT', 'Bearer') : token) || '',
    ...options.headers
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'omit'
  });

  checkRateLimit(response);

  if (!response.ok) {
    if (response.status === 401) {
      // Token invalide, déconnecter l'utilisateur
      await signOut();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    throw new Error(`Erreur API: ${response.status}`);
  }

  return await response.json();
}

/**
 * Récupère les informations utilisateur sauvegardées
 */
async function getUserInfo() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user'], (result) => {
      resolve(result.user || null);
    });
  });
}

/**
 * Récupère la liste des items Riven disponibles
 * @returns {Promise<Array>} Liste des items
 */
async function getRivenItems() {
  try {
    const language = await getLanguage();
    const response = await fetch(`${API_BASE_URL}/riven/items`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': language
      }
    });

    checkRateLimit(response);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.payload.items;
  } catch (error) {
    console.error('Erreur lors de la récupération des items Riven:', error);
    return [];
  }
}

/**
 * Récupère la liste des attributs Riven disponibles
 * @returns {Promise<Array>} Liste des attributs
 */
async function getRivenAttributes() {
  try {
    const language = await getLanguage();
    const response = await fetch(`${API_BASE_URL}/riven/attributes`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': language
      }
    });

    checkRateLimit(response);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.payload.attributes;
  } catch (error) {
    console.error('Erreur lors de la récupération des attributs Riven:', error);
    return [];
  }
}

/**
 * Recherche des enchères de Riven
 * @param {Object} params - Paramètres de recherche
 * @returns {Promise<Array>} Liste des enchères
 */
async function searchAuctions(params) {
  try {
    // Construire les query params
    const queryParams = new URLSearchParams();
    
    // Valeurs par défaut
    if (!params.platform) params.platform = 'pc';
    if (!params.buyout_policy) params.buyout_policy = 'direct'; // On préfère souvent les ventes directes par défaut
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    }

    const language = await getLanguage();
    const response = await fetch(`${API_BASE_URL}/auctions/search?type=riven&${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': language
      }
    });

    checkRateLimit(response);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.payload.auctions || [];
  } catch (error) {
    console.error('Erreur lors de la recherche d\'enchères:', error);
    return [];
  }
}

/**
 * Crée une enchère pour un Riven
 * @param {Object} auctionData - Données de l'enchère
 * @returns {Promise<Object>} Résultat de la création
 */
async function createAuction(auctionData) {
  try {
    const response = await authenticatedRequest('/auctions/create', {
      method: 'POST',
      body: JSON.stringify(auctionData)
    });
    return { success: true, data: response.payload };
  } catch (error) {
    console.error('Erreur lors de la création de l\'enchère:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour une enchère existante
 * @param {string} auctionId - ID de l'enchère
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
async function updateAuction(auctionId, updateData) {
  try {
    const response = await authenticatedRequest(`/auctions/entry/${auctionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    return { success: true, data: response.payload };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enchère:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ferme (supprime) une enchère
 * @param {string} auctionId - ID de l'enchère
 * @returns {Promise<Object>} Résultat de la suppression
 */
async function closeAuction(auctionId) {
  try {
    const response = await authenticatedRequest(`/auctions/entry/${auctionId}/close`, {
      method: 'PUT'
    });
    return { success: true, data: response.payload };
  } catch (error) {
    console.error('Erreur lors de la fermeture de l\'enchère:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les enchères d'un profil
 * @param {string} slug - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des enchères
 */
async function getProfileAuctions(slug) {
  try {
    const language = await getLanguage();
    const response = await fetch(`${API_BASE_URL}/profile/${slug}/auctions`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': language
      }
    });

    checkRateLimit(response);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.payload.auctions || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères du profil:', error);
    return [];
  }
}

/**
 * Get user orders (not auctions) - API v2
 * @returns {Promise<Array>} Liste des commandes
 */
async function getUserOrders() {
  return requestQueue.add(async () => {
    const response = await authenticatedRequest('/orders/my', {
      method: 'GET'
    }, API_V2_BASE_URL);
    return response.data || [];
  });
}

/**
 * Get item information by slug - API v2
 * @param {string} slug - Item slug
 * @returns {Promise<Object>} Item information
 */
async function getItemBySlug(slug) {
  return requestQueue.add(async () => {
    const [token, language] = await Promise.all([getAuthToken(), getLanguage()]);
    const response = await fetch(`${API_V2_BASE_URL}/item/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
        'Language': language
      },
      credentials: 'omit'
    });
    
    checkRateLimit(response);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    return await response.json();
  });
}

/**
 * Update an order's platinum price - API v2
 * @param {string} orderId - Order ID
 * @param {number} platinum - New platinum value
 * @param {string} [tag] - Optional queue tag for cancellation
 * @returns {Promise<Object>} Updated order
 */
async function updateOrder(orderId, platinum, tag = 'stay-updated') {
  return requestQueue.add(async () => {
    return authenticatedRequest(`/order/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ platinum })
    }, API_V2_BASE_URL);
  }, tag);
}

/**
 * Get orders for a specific item to find minimum price - API v2
 * @param {string} slug - Item slug
 * @returns {Promise<Object>} Item orders
 */
async function getItemOrders(slug) {
  return requestQueue.add(async () => {
    const [token, language] = await Promise.all([getAuthToken(), getLanguage()]);
    const response = await fetch(`${API_V2_BASE_URL}/orders/item/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
        'Language': language
      },
      credentials: 'omit'
    });
    
    checkRateLimit(response);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    return await response.json();
  });
}

// Exporter les fonctions pour utilisation dans d'autres scripts
window.WarframeAPI = {
  signIn,
  signOut,
  isAuthenticated,
  getAuthToken,
  authenticatedRequest,
  getUserInfo,
  getLanguage,
  setLanguage,
  getRivenItems,
  getRivenAttributes,
  searchAuctions,
  createAuction,
  updateAuction,
  closeAuction,
  getProfileAuctions,
  getUserOrders,
  getItemBySlug,
  getItemOrders,
  updateOrder,
  requestQueue
};
