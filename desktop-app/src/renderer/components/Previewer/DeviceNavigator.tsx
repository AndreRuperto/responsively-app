import {Icon} from '@iconify/react';
import cx from 'classnames';
import {Device} from 'common/deviceList';

interface Props {
  devices: Device[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onFitAll: () => void;
  onToggleAutoLayout: () => void;
  autoLayoutEnabled: boolean;
}

/**
 * A persistent, keyboard-accessible index of every preview in the suite.
 * It does not mount or reparent webviews; selecting a device moves the
 * existing viewport instead.
 */
const DeviceNavigator = ({
  devices,
  selectedId,
  onSelect,
  onFitAll,
  onToggleAutoLayout,
  autoLayoutEnabled,
}: Props) => {
  const selectedIndex = Math.max(0, devices.findIndex((device) => device.id === selectedId));
  const move = (direction: -1 | 1) => {
    const next = devices[selectedIndex + direction];
    if (next) onSelect(next.id);
  };

  return (
    <nav
      data-testid="device-navigator"
      aria-label="Navigate device previews"
      className="flex min-w-0 shrink-0 items-center gap-2 border-b border-line-soft bg-panel px-3 py-2 text-fg"
    >
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          data-testid="device-previous"
          aria-label="Previous device"
          title="Previous device"
          disabled={selectedIndex === 0}
          onClick={() => move(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Icon icon="lucide:chevron-left" fontSize={18} />
        </button>
        <span
          data-testid="device-counter"
          aria-live="polite"
          className="min-w-[40px] text-center font-mono text-[11px] text-muted"
        >
          {devices.length ? selectedIndex + 1 : 0}/{devices.length}
        </span>
        <button
          type="button"
          data-testid="device-next"
          aria-label="Next device"
          title="Next device"
          disabled={selectedIndex >= devices.length - 1}
          onClick={() => move(1)}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Icon icon="lucide:chevron-right" fontSize={18} />
        </button>
      </div>
      <div
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1"
        role="group"
        aria-label="Devices in this suite"
      >
        {devices.map((device) => {
          const selected = device.id === devices[selectedIndex]?.id;
          const icon = device.type === 'notebook'
            ? 'lucide:laptop'
            : device.type === 'tablet'
              ? 'lucide:tablet'
              : 'lucide:smartphone';
          return (
            <button
              type="button"
              key={device.id}
              data-testid="device-chip"
              aria-pressed={selected}
              aria-label={`View ${device.name}, ${device.width} by ${device.height}`}
              title={device.name}
              onClick={() => onSelect(device.id)}
              className={cx(
                'flex h-8 max-w-[190px] shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-accent',
                selected
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line bg-panel text-muted hover:bg-hover hover:text-fg'
              )}
            >
              <Icon icon={icon} fontSize={14} className="shrink-0" />
              <span className="truncate">{device.name}</span>
              <span className="shrink-0 font-mono text-[10px] opacity-65">
                {device.width}×{device.height}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-1 border-l border-line pl-2">
        <button
          type="button"
          data-testid="fit-all"
          onClick={onFitAll}
          title="Fit every device into the available space"
          className="flex h-8 items-center gap-1 rounded-md px-2 text-[11.5px] font-medium hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon icon="lucide:scan" fontSize={15} />
          Fit all
        </button>
        <button
          type="button"
          data-testid="auto-layout"
          aria-pressed={autoLayoutEnabled}
          title="Automatically choose a row or grid as the window changes size"
          onClick={onToggleAutoLayout}
          className={cx(
            'flex h-8 items-center gap-1 rounded-md px-2 text-[11.5px] font-medium focus-visible:outline-2 focus-visible:outline-accent',
            autoLayoutEnabled ? 'bg-accent-soft text-accent' : 'hover:bg-hover'
          )}
        >
          <Icon icon="lucide:layout-grid" fontSize={15} />
          Auto
        </button>
      </div>
    </nav>
  );
};

export default DeviceNavigator;
