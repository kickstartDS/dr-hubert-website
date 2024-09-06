/*  eslint react/display-name: 0 */
import {
  ComponentProps,
  FC,
  HTMLAttributes,
  PropsWithChildren,
  forwardRef,
} from "react";
import classnames from "classnames";
import {
  NavTopbarContextDefault as DsaNavTopbar,
  NavTopbarContext,
} from "@kickstartds/ds-agency-premium/nav-topbar";

import { Icon } from "@kickstartds/base/lib/icon";
import { NavDropdown } from "@kickstartds/ds-agency-premium/components/nav-dropdown/index.js";
import { Link } from "@kickstartds/base/lib/link";

export const NavTopbarContextDefault = forwardRef<
  HTMLElement,
  ComponentProps<typeof DsaNavTopbar> & HTMLAttributes<HTMLElement>
>(({ items, inverted }, ref) =>
  items && items.length > 0 ? (
    <nav
      className="dsa-nav-topbar"
      id="dsa-nav-main"
      aria-label="Hauptnavigation"
      ref={ref}
    >
      <ul className="dsa-nav-topbar__list">
        {items.map(({ label, href, active, items: subItems }) => {
          return (
            <li
              className={classnames(
                "dsa-nav-topbar__item",
                active && "dsa-nav-topbar__item--active",
                subItems?.length && "dsa-nav-topbar__item--dropdown"
              )}
              key={href}
            >
              {subItems?.length ? (
                <span tabIndex={0} className="dsa-nav-topbar__label">
                  {label}
                  {subItems?.length ? (
                    <Icon
                      className="dsa-nav-topbar__label__icon"
                      icon="chevron-down"
                    />
                  ) : (
                    ""
                  )}
                </span>
              ) : (
                <Link
                  href={href}
                  className={`dsa-nav-topbar__label dsa-nav-topbar__link`}
                >
                  {label}
                </Link>
              )}

              {subItems?.length ? (
                <NavDropdown items={subItems} inverted={inverted} />
              ) : null}
            </li>
          );
        })}

        <ul className="dsa-nav-topbar__lang">
          <li className="dsa-nav-topbar__lang__item">
            <Link
              href="#"
              className="dsa-nav-topbar__lang__link dsa-nav-topbar__lang__link--active"
            >
              DE
            </Link>
          </li>
          <li className="dsa-nav-topbar__lang__item">
            <Link href="#" className="dsa-nav-topbar__lang__link">
              EN
            </Link>
          </li>
        </ul>
      </ul>
    </nav>
  ) : null
);

export const NavTopbarProvider: FC<PropsWithChildren> = (props) => (
  <NavTopbarContext.Provider {...props} value={NavTopbarContextDefault} />
);
