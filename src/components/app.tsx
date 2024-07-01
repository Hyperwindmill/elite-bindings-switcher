import { createRoot } from "react-dom/client";
import { BackupView } from "./backup.view";
import { BindingsService } from "../services/bindings.service";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeflex/primeflex.css";

const root = createRoot(document.body);
const bindingsService = new BindingsService();
root.render(
  <PrimeReactProvider>
    <h1>Elite Dangerous Bindings Switcher</h1>
    <BackupView service={bindingsService}></BackupView>
  </PrimeReactProvider>
);
