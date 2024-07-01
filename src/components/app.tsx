import { createRoot } from "react-dom/client";
import { BackupView } from "./backup.view";
import { BindingsService } from "../services/bindings.service";

const root = createRoot(document.body);
const bindingsService = new BindingsService();
root.render(
  <>
    <h1>Elite Dangerous Bindings Switcher</h1>
    <BackupView service={bindingsService}></BackupView>
  </>
);
