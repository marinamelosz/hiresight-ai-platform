const API_BASE_URL = "http://localhost:5000/api";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "login") {
    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          chrome.storage.local.set({
            access_token: data.access_token,
            user: data.user,
          });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: data.error });
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
        sendResponse({ success: false, error: "Erro de rede ou servidor." });
      });
    return true; // Indica que a resposta será enviada assincronamente
  } else if (request.action === "logout") {
    chrome.storage.local.remove(["access_token", "user"]);
    sendResponse({ success: true });
  } else if (request.action === "fetchFromBackend") {
    chrome.storage.local.get(["access_token"], (result) => {
      if (!result.access_token) {
        sendResponse({ success: false, error: "Não autenticado." });
        return;
      }

      fetch(`${API_BASE_URL}${request.url}`, {
        method: request.method || "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${result.access_token}`,
        },
        body: request.method === "POST" || request.method === "PUT" ? JSON.stringify(request.body) : undefined,
      })
        .then((response) => {
          if (response.status === 401) {
            // Token expirado ou inválido, deslogar
            chrome.storage.local.remove(["access_token", "user"]);
            sendResponse({ success: false, error: "Sessão expirada. Faça login novamente." });
            return;
          }
          return response.json();
        })
        .then((data) => {
          sendResponse({ success: true, data: data });
        })
        .catch((error) => {
          console.error("Backend fetch failed:", error);
          sendResponse({ success: false, error: "Erro ao comunicar com o backend." });
        });
    });
    return true; // Indica que a resposta será enviada assincronamente
  }
});

