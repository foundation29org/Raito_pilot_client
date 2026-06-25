import { Directive, HostListener, Inject } from '@angular/core';

import { SidebarLinkDirective } from "./sidebar-link.directive";

@Directive({
    selector: "[appSidebarAnchorToggle]",
    standalone: false
})
export class SidebarAnchorToggleDirective {
  protected navlink: SidebarLinkDirective;

  constructor(
    @Inject(SidebarLinkDirective) navlink: SidebarLinkDirective
  ) {
    this.navlink = navlink;
  }

  @HostListener("click", ["$event"])
  onClick() {
    this.navlink.toggle();
  }
}
