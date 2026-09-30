export interface Action {
  id: string;
  label: string;
  icon?: string;
  // F-046: a control whose destination does not exist must be honestly disabled rather
  // than silently swallowing a tap. Rendered as a native `disabled` button, so the
  // platform removes it from the tab order and cannot fire the click.
  disabled?: boolean;
}