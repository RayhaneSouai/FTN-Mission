import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
    hasUnsavedChanges(): boolean;
}

/**
 * Route guard that checks for unsaved form changes.
 * Components must implement the HasUnsavedChanges interface.
 * The actual confirmation dialog is handled by the component itself,
 * since the form is a modal child, not a routed component.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
    if (component.hasUnsavedChanges()) {
        // The component should handle showing the confirm dialog
        // and return false to prevent navigation until confirmed.
        return false;
    }
    return true;
};
