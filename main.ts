import { App, addIcon, Plugin, PluginSettingTab, Setting } from "obsidian";

const nameOfApplication = `Soomda`;

interface SoomdaPluginSettings {
	both: boolean;
	justLeft: boolean;
	justRight: boolean;
	rememberSidebar: boolean;
}

const DEFAULT_SETTINGS: SoomdaPluginSettings = {
	both: true,
	justLeft: false,
	justRight: false,
	rememberSidebar: false,
};

const soomdaIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Leaf</title><path fill="currentColor" d="M161.35 242a16 16 0 0122.62-.68c73.63 69.36 147.51 111.56 234.45 133.07 11.73-32 12.77-67.22 2.64-101.58-13.44-45.59-44.74-85.31-90.49-114.86-40.84-26.38-81.66-33.25-121.15-39.89-49.82-8.38-96.88-16.3-141.79-63.85-5-5.26-11.81-7.37-18.32-5.66-7.44 2-12.43 7.88-14.82 17.6-5.6 22.75-2 86.51 13.75 153.82 25.29 108.14 65.65 162.86 95.06 189.73 38 34.69 87.62 53.9 136.93 53.9a186 186 0 0027.77-2.04c41.71-6.32 76.43-27.27 96-57.75-89.49-23.28-165.94-67.55-242-139.16a16 16 0 01-.65-22.65zM467.43 384.19c-16.83-2.59-33.13-5.84-49-9.77a157.71 157.71 0 01-12.13 25.68c-.73 1.25-1.5 2.49-2.29 3.71a584.21 584.21 0 0058.56 12 16 16 0 104.87-31.62z"/></svg>`;

export default class SoomdaPlugin extends Plugin {
	settings: SoomdaPluginSettings;

	async onload() {
		await this.loadSettings();

		addIcon("icon", soomdaIcon);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"icon",
			"Toggle Soomda",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				this.togglePanes();
			}
		);

		await this.checkSidebars();

		// Adds command to show sidebars
		this.addCommand({
			id: "show-sidebars",
			name: "Show sidebars",
			callback: () => {
				this.showSidebars();
			},
		});
		// Adds command to hide sidebars
		this.addCommand({
			id: "hide-sidebars",
			name: "Hide sidebars",
			callback: () => {
				this.hideSidebars();
			},
		});
		// Adds command to toggle sidebars
		this.addCommand({
			id: "toggle-sidebars",
			name: "Toggle sidebars",
			callback: () => {
				this.togglePanes();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SoomdaSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async hideSidebars() {
		const workspace = this.app.workspace;
		const leftSplit = workspace.leftSplit;
		const rightSplit = workspace.rightSplit;

		leftSplit.collapse();
		rightSplit.collapse();
	}

	async showSidebars() {
		const workspace = this.app.workspace;
		const leftSplit = workspace.leftSplit;
		const rightSplit = workspace.rightSplit;

		leftSplit.expand();
		rightSplit.expand();
	}

	async togglePanes() {
		const workspace = this.app.workspace;
		const leftSplit = workspace.leftSplit;
		const rightSplit = workspace.rightSplit;

		const currentBoth = this.settings.both;
		const currentJustLeft = this.settings.justLeft;
		const currentJustRight = this.settings.justRight;

		if (this.settings.rememberSidebar) {
			await this.checkSidebars();

			if (!leftSplit.collapsed || !rightSplit.collapsed) {
				leftSplit.collapse();
				rightSplit.collapse();
				return;
			}

			if (currentBoth) {
				leftSplit.expand();
				rightSplit.expand();
				return;
			}

			if (currentJustLeft) {
				leftSplit.expand();
				rightSplit.collapse();
				return;
			}

			if (currentJustRight) {
				leftSplit.collapse();
				rightSplit.expand();
				return;
			}
		} else {
			if (leftSplit.collapsed && rightSplit.collapsed) {
				leftSplit.expand();
				rightSplit.expand();
			} else {
				leftSplit.collapse();
				rightSplit.collapse();
			}
		}
	}

	async checkSidebars() {
		
		this.app.workspace.onLayoutReady(async () => {
			const leftSplit = this.app.workspace.leftSplit;
			const rightSplit = this.app.workspace.rightSplit;
		
			if (!leftSplit.collapsed && !rightSplit.collapsed) {
				this.settings.both = true;
				this.settings.justLeft = false;
				this.settings.justRight = false;
			}

			if (leftSplit.collapsed && !rightSplit.collapsed) {
				this.settings.justRight = true;
				this.settings.justLeft = false;
				this.settings.both = false;
			}

			if (rightSplit.collapsed && !leftSplit.collapsed) {
				this.settings.justRight = false;
				this.settings.justLeft = true;
				this.settings.both = false;
			}
			
			await this.saveSettings();
		})
	}
}

class SoomdaSettingTab extends PluginSettingTab {
	plugin: SoomdaPlugin;

	constructor(app: App, plugin: SoomdaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h3", {
			text: `${nameOfApplication} — Quickly hide your sidebars.`,
		});
		containerEl.createEl("h4", {
			text: "v" + this.plugin.manifest.version,
		});
		containerEl.createEl("span", {
			text: `If ${nameOfApplication} has helped you focus, consider buying me a slice of pizza 🍕 `,
		});
		containerEl.createEl("a", {
			text: "Buy Michael, a slice of pizza",
			href: "https://michaellee.gumroad.com/l/buy-michael-pizza",
		});
		containerEl.createEl("br");
		containerEl.createEl("br");

		// Adds settings option to toggle remembering last open sidebar
		new Setting(containerEl)
			.setName("Remember sidebar")
			.setDesc(
				`When this option is turned on, ${nameOfApplication} will remember the sidebar which was last open and just toggle that pane.`
			)
			.addToggle((title) =>
				title
					.setValue(this.plugin.settings.rememberSidebar)
					.onChange(async () => {
						this.plugin.settings.rememberSidebar = await this.plugin.settings.rememberSidebar ? false : true;
						await this.plugin.saveSettings();
					})
			);
	}
}
