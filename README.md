# Elite Dangerous Bindings Switcher

Elite Dangerous Bindings Switcher è un'applicazione desktop per Linux che permette di effettuare il backup e il ripristino delle configurazioni dei controlli di Elite Dangerous. L'app utilizza Electron per fornire una semplice interfaccia utente.

## Caratteristiche

- Backup delle configurazioni dei controlli di Elite Dangerous
- Ripristino delle configurazioni dai backup
- Elenco dei backup disponibili

## Prerequisiti

- Node.js
- npm (Node Package Manager)

## Installazione

1. Clona il repository:
    ```bash
    git clone https://github.com/tuo_utente/elite-bindings-switcher.git
    cd elite-bindings-switcher
    ```

2. Installa le dipendenze:
    ```bash
    npm install
    ```

3. Crea un file `.env` nella directory del progetto con il seguente contenuto, sostituendo il percorso con quello della tua cartella `steamapps`:
    ```
    STEAM_PATH=/home/tuo_utente/.local/share/Steam/steamapps
    ```

## Utilizzo

Avvia l'applicazione con il seguente comando:
```bash
npm start
