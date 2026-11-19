"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  X,
  Search,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface ComboboxOption {
  value: string | number;
  label: string;
  group?: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface ComboboxGroupMeta {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface ComboboxProps {
  id?: string;
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  groupMeta?: Record<string, ComboboxGroupMeta>;
  className?: string;
}

export default function Combobox({
  id: externalId,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  emptyText = "No options found",
  label,
  required,
  error,
  disabled = false,
  loading = false,
  errorMessage,
  onRetry,
  groupMeta = {},
  className = "",
}: ComboboxProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const listboxId = `${id}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Position state for floating desktop dropdown
  const [panelCoords, setPanelCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect client mount & viewport width
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Selected option lookup
  const selectedOption = useMemo(() => {
    if (value === "" || value === undefined || value === null) return null;
    return options.find((opt) => String(opt.value) === String(value)) || null;
  }, [options, value]);

  // Filtered options based on search query (case-insensitive, matches label and group)
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;

    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const groupLabel =
        opt.group && groupMeta[opt.group]
          ? groupMeta[opt.group].label.toLowerCase()
          : opt.group?.toLowerCase() || "";
      const matchGroup = groupLabel.includes(q);
      const matchSub = opt.subLabel?.toLowerCase().includes(q) || false;
      return matchLabel || matchGroup || matchSub;
    });
  }, [options, search, groupMeta]);

  // Grouped structure of filtered options
  const groupedOptions = useMemo(() => {
    const groups: {
      groupKey: string;
      meta?: ComboboxGroupMeta;
      items: ComboboxOption[];
    }[] = [];

    const ungrouped: ComboboxOption[] = [];
    const map = new Map<string, ComboboxOption[]>();

    for (const opt of filteredOptions) {
      if (!opt.group) {
        ungrouped.push(opt);
      } else {
        const list = map.get(opt.group);
        if (list) {
          list.push(opt);
        } else {
          map.set(opt.group, [opt]);
        }
      }
    }

    // Preserve order defined in groupMeta or encountered
    const groupKeys = Object.keys(groupMeta);
    const handledKeys = new Set<string>();

    for (const key of groupKeys) {
      const items = map.get(key);
      if (items && items.length > 0) {
        groups.push({
          groupKey: key,
          meta: groupMeta[key],
          items,
        });
        handledKeys.add(key);
      }
    }

    // Any remaining groups not in groupMeta
    for (const [key, items] of map.entries()) {
      if (!handledKeys.has(key)) {
        groups.push({
          groupKey: key,
          meta: { label: key },
          items,
        });
      }
    }

    // Ungrouped items at the top or bottom
    if (ungrouped.length > 0) {
      groups.unshift({
        groupKey: "__ungrouped__",
        items: ungrouped,
      });
    }

    return groups;
  }, [filteredOptions, groupMeta]);

  // Flat list of selectable options (to handle arrow key navigation easily)
  const selectableOptions = useMemo(() => {
    return filteredOptions.filter((opt) => !opt.disabled);
  }, [filteredOptions]);

  // Recalculate floating desktop position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || isMobile) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const expectedHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward = spaceBelow < expectedHeight && spaceAbove > spaceBelow;

    setPanelCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: rect.width,
      openUpward,
    });
  }, [isMobile]);

  // Handle open/close
  const openCombobox = useCallback(() => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
    setSearch("");

    // Set highlighted index to currently selected option or first option
    if (selectedOption) {
      const idx = selectableOptions.findIndex(
        (o) => String(o.value) === String(selectedOption.value)
      );
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(0);
    }
  }, [disabled, updatePosition, selectedOption, selectableOptions]);

  const closeCombobox = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
    // Return focus to trigger
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  const toggleCombobox = useCallback(() => {
    if (isOpen) {
      closeCombobox();
    } else {
      openCombobox();
    }
  }, [isOpen, openCombobox, closeCombobox]);

  // Prevent background scrolling on mobile when sheet is open
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  // Update position on scroll/resize when open
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const onScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [isOpen, isMobile, updatePosition]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        closeCombobox();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, closeCombobox]);

  // Keep highlighted item scrolled into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const highlightedEl = listRef.current.querySelector(
      `[data-option-index="${highlightedIndex}"]`
    );
    if (highlightedEl) {
      highlightedEl.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Reset highlight to top when search changes
  useEffect(() => {
    setHighlightedIndex(selectableOptions.length > 0 ? 0 : -1);
  }, [search, selectableOptions.length]);

  // Select an option
  const handleSelectOption = (opt: ComboboxOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    closeCombobox();
  };

  // Clear value
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCombobox();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (selectableOptions.length === 0) return;
        setHighlightedIndex((prev) =>
          prev < selectableOptions.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (selectableOptions.length === 0) return;
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : selectableOptions.length - 1
        );
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < selectableOptions.length
        ) {
          handleSelectOption(selectableOptions[highlightedIndex]);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        closeCombobox();
        break;
      }
      case "Tab": {
        closeCombobox();
        break;
      }
    }
  };

  // Highlighted item ID for aria-activedescendant
  const activeDescendantId =
    isOpen && highlightedIndex >= 0 && highlightedIndex < selectableOptions.length
      ? `${id}-opt-${selectableOptions[highlightedIndex].value}`
      : undefined;

  // Render floating popover (Desktop) or bottom sheet (Mobile)
  const renderPanel = () => {
    if (!isOpen || !mounted) return null;

    const panelContent = (
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label || placeholder}
        onKeyDown={handleKeyDown}
        className={
          isMobile
            ? "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-card border-t border-line rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
            : `fixed z-50 bg-card border border-line rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ${
                panelCoords.openUpward
                  ? "-translate-y-full origin-bottom"
                  : "origin-top"
              }`
        }
        style={
          isMobile
            ? undefined
            : {
                top: `${panelCoords.top}px`,
                left: `${panelCoords.left}px`,
                width: `${panelCoords.width}px`,
              }
        }
      >
        {/* Mobile drag handle & title */}
        {isMobile && (
          <div className="pt-3 pb-2 px-4 border-b border-line flex items-center justify-between shrink-0 bg-soft/50">
            <div className="w-10 h-1 bg-line rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <span className="text-xs font-bold text-ink truncate mt-1">
              {label || placeholder}
            </span>
            <button
              type="button"
              onClick={closeCombobox}
              className="p-1 rounded-lg text-mute hover:text-ink hover:bg-soft transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Search Input Box */}
        <div className="p-2.5 border-b border-line shrink-0 bg-card">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium text-ink bg-soft border border-line placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={activeDescendantId}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-mute hover:text-ink"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Options List Container */}
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={label || placeholder}
          className="overflow-y-auto max-h-64 sm:max-h-72 p-1.5 space-y-1"
        >
          {/* Loading State */}
          {loading ? (
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-mute py-3">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span>Loading campus options…</span>
              </div>
              <div className="space-y-1.5 animate-pulse">
                <div className="h-8 bg-soft rounded-lg" />
                <div className="h-8 bg-soft rounded-lg" />
                <div className="h-8 bg-soft rounded-lg" />
              </div>
            </div>
          ) : errorMessage ? (
            /* Error State with Retry */
            <div className="p-4 text-center space-y-2">
              <div className="inline-flex p-2 rounded-full bg-rose-500/10 text-rose-500">
                <AlertCircle size={18} />
              </div>
              <p className="text-xs font-medium text-rose-500">{errorMessage}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : filteredOptions.length === 0 ? (
            /* Empty Search State */
            <div className="p-6 text-center space-y-1.5">
              <Search size={22} className="mx-auto text-mute opacity-40" />
              <p className="text-xs font-semibold text-ink">{emptyText}</p>
              {search && (
                <p className="text-[11px] text-mute">
                  No matches found for &ldquo;{search}&rdquo;
                </p>
              )}
            </div>
          ) : (
            /* Grouped Options */
            groupedOptions.map((group) => {
              const isUngrouped = group.groupKey === "__ungrouped__";
              const GroupIcon = group.meta?.icon;

              return (
                <div key={group.groupKey} className="space-y-0.5">
                  {!isUngrouped && (
                    <div className="sticky top-0 bg-card/95 backdrop-blur-xs px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mute flex items-center gap-1.5 z-10 border-b border-line/40">
                      {GroupIcon && <GroupIcon size={12} className="text-indigo-500 shrink-0" />}
                      <span className="truncate">{group.meta?.label || group.groupKey}</span>
                      <span className="ml-auto text-[9px] font-mono text-mute/80">
                        {group.items.length}
                      </span>
                    </div>
                  )}

                  {group.items.map((opt) => {
                    const isSelected =
                      selectedOption !== null &&
                      String(selectedOption.value) === String(opt.value);
                    const selectableIndex = selectableOptions.findIndex(
                      (o) => String(o.value) === String(opt.value)
                    );
                    const isHighlighted = selectableIndex === highlightedIndex;

                    return (
                      <div
                        key={String(opt.value)}
                        id={`${id}-opt-${opt.value}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        data-option-index={selectableIndex}
                        onClick={() => handleSelectOption(opt)}
                        onMouseEnter={() => {
                          if (!opt.disabled && selectableIndex >= 0) {
                            setHighlightedIndex(selectableIndex);
                          }
                        }}
                        className={`min-h-[44px] sm:min-h-[38px] px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors select-none ${
                          opt.disabled
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          isSelected
                            ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold"
                            : isHighlighted
                            ? "bg-soft text-ink font-medium"
                            : "text-ink hover:bg-soft"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{opt.label}</div>
                          {opt.subLabel && (
                            <div className="text-[10px] text-mute truncate mt-0.5">
                              {opt.subLabel}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check
                            size={15}
                            strokeWidth={2.5}
                            className="text-indigo-600 dark:text-indigo-400 shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    // If mobile, render backdrop + sheet
    if (isMobile) {
      return createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={closeCombobox}
          />
          {panelContent}
        </>,
        document.body
      );
    }

    // If desktop, render into portal to avoid any parent clipping
    return createPortal(panelContent, document.body);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-ink mb-1.5 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {loading && <Loader2 size={12} className="animate-spin text-indigo-500" />}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        onClick={toggleCombobox}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-xl border ${
          error ? "border-rose-500 ring-1 ring-rose-500" : "border-line"
        } bg-soft px-3.5 py-2.5 text-xs font-medium text-left text-ink transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#818cf8]`}
      >
        <span
          className={`truncate flex-1 ${
            selectedOption ? "text-ink font-semibold" : "text-mute"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {/* Clear button when an option is selected */}
          {selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="p-1 rounded-md text-mute hover:text-ink hover:bg-card/60 transition-colors"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X size={13} />
            </span>
          )}

          {/* Rotating Chevron */}
          <ChevronDown
            size={14}
            className={`text-mute transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Inline Validation Error Message */}
      {error && (
        <p
          id={`${id}-error`}
          className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium"
        >
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Floating Panel / Mobile Sheet Portal */}
      {renderPanel()}
    </div>
  );
}
