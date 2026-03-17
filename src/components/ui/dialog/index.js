/**
 * Dialog UI: re-exports from radix-vue and adds Header/Footer wrappers.
 * @module components/ui/dialog
 */
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogDescription,
} from 'radix-vue';

const DialogHeader = {
  name: 'DialogHeader',
  template: '<div class="dialog-header"><slot /></div>',
};

const DialogFooter = {
  name: 'DialogFooter',
  template: '<div class="dialog-footer"><slot /></div>',
};

export {
  DialogRoot as Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogDescription,
};
