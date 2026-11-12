import { useRef, type KeyboardEvent } from "react";
import type { EquipmentCategory } from "../../core/catalog";
import { EquipmentIcon } from "../components/EquipmentIcon";
import { useI18n } from "../i18n";

export const CATEGORIES: EquipmentCategory[] = [
  "networking",
  "processing",
  "storage",
  "cooling",
  "infrastructure",
];

const CATEGORY_ICON: Record<EquipmentCategory, string> = {
  networking: "router",
  processing: "cpu",
  storage: "hard-drive",
  cooling: "snowflake",
  infrastructure: "plug-zap",
};

interface Props {
  value: EquipmentCategory;
  onChange: (c: EquipmentCategory) => void;
  /** Categorias com ao menos um equipamento novo (ainda não comprado) possível de comprar. */
  available: ReadonlySet<EquipmentCategory>;
}

export function CategoryTabs({ value, onChange, available }: Props) {
  const { t } = useI18n();
  const refs = useRef<
    Partial<Record<EquipmentCategory, HTMLButtonElement | null>>
  >({});

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = CATEGORIES.indexOf(value);
    let next: number;
    if (e.key === "ArrowRight") next = (i + 1) % CATEGORIES.length;
    else if (e.key === "ArrowLeft")
      next = (i - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = CATEGORIES.length - 1;
    else return;
    e.preventDefault();
    const c = CATEGORIES[next];
    if (!c) return;
    onChange(c);
    refs.current[c]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("shop.category")}
        onKeyDown={onKeyDown}
        className="flex gap-1 lg:flex-wrap"
      >
        {CATEGORIES.map((c) => {
          const active = value === c;
          return (
            <button
              key={c}
              ref={(el) => {
                refs.current[c] = el;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={t(`category.${c}`)}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(c)}
              className={`relative flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded border px-1 font-mono text-xs whitespace-nowrap lg:min-h-9 lg:flex-none lg:px-2 lg:text-[11px] ${active ? "border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan" : "border-white/10 text-white/50 hover:text-white"}`}
            >
              <EquipmentIcon
                name={CATEGORY_ICON[c]}
                className="size-4 shrink-0"
              />
              <span className="hidden lg:inline">{t(`category.${c}`)}</span>
              {available.has(c) && (
                <span
                  role="img"
                  aria-label={t("shop.category.available")}
                  data-testid="category-available"
                  className="absolute top-1 right-1 size-2.5 shrink-0 rounded-full bg-neon-magenta shadow-[0_0_6px_var(--color-neon-magenta)] lg:static lg:size-2"
                />
              )}
            </button>
          );
        })}
      </div>
      <p
        aria-hidden="true"
        className="mt-1 font-mono text-[11px] text-neon-cyan lg:hidden"
      >
        {t(`category.${value}`)}
      </p>
    </div>
  );
}
