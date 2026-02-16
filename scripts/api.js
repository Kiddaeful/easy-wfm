// Module API pour Warframe Market (API v1 - Simple Login)

const API_BASE_URL = 'https://api.warframe.market/v1';

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
 */
async function authenticatedRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Non authentifié');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token,
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    const response = await fetch(`${API_BASE_URL}/riven/items`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': 'en' // Par défaut en anglais pour matcher l'OCR qui est souvent en anglais sur Warframe
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
    const response = await fetch(`${API_BASE_URL}/riven/attributes`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': 'en' // Par défaut en anglais
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

    const response = await fetch(`${API_BASE_URL}/auctions/search?type=riven&${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': 'en'
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
    const response = await fetch(`${API_BASE_URL}/profile/${slug}/auctions`, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Language': 'en'
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

// Exporter les fonctions pour utilisation dans d'autres scripts
window.WarframeAPI = {
  signIn,
  signOut,
  isAuthenticated,
  getAuthToken,
  authenticatedRequest,
  getUserInfo,
  getRivenItems,
  getRivenAttributes,
  searchAuctions,
  createAuction,
  updateAuction,
  closeAuction,
  getProfileAuctions
};
