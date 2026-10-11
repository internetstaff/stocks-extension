# [stocks-extension](https://extensions.gnome.org/extension/1422/stocks-extension/)

A extension to display stock quotes in GNOME Shell Panel

<p align="middle">
    <img alt="projects" src="images/overview.png" width="700">
</p>

<p align="middle">
    <img alt="commits" src="images/crayons.png" width="350">
    <img alt="commits" src="images/transactions.png" width="350">
</p>

*stocks-extension* integrates stock quotes to your GNOME Shell Panel =)

----

## Installation

This extension is available in the [GNOME Shell Extension Directory](https://extensions.gnome.org/extension/1422/stocks-extension/).

### Manual Installation

#### Release Package
[Download](https://github.com/internetstaff/stocks-extension/releases) a release and put the content into `~/.local/share/gnome-shell/extensions/stocks@infinicode.de` (you need to create a directory).

#### Make install

Clone the repo and run `make install`

## Data Provider

Data is cached for no less than 5 minutes and will reload automatically. Click refresh to force a fresh pull immediately.

Data is provided by [Yahoo Finance](https://finance.yahoo.com/).

## Add Stocks

To add stocks you need the provider related symbol / identifier. You should be able to get them from yahoo finance pages.

1. Open Settings
2. Add or Select a Portfolio
3. Click on the + icon on the bottom of the first tab
4. Enter Symbol (e.g. *AHLA.DE*) and give it a name


### debug

Since GNOME 49, nested sessions use `--devkit`, which needs the Mutter devkit viewer installed
(e.g. `sudo dnf install mutter-devkit` on Fedora). Without it the shell starts headless and no window appears.

```sh
make install
dbus-run-session -- gnome-shell --devkit --wayland
```

The extension must be enabled (`gnome-extensions enable stocks@infinicode.de`). Re-run `make install` and restart the nested session after each change.
