import { App, PluginSettingTab, Setting } from "obsidian";
import type CodeBlockFoldPlugin from "./main";

export interface CodeBlockFoldSettings {
	foldThreshold: number;
}

export const DEFAULT_SETTINGS: CodeBlockFoldSettings = {
	foldThreshold: 5,
};

export class CodeBlockFoldSettingTab extends PluginSettingTab {
	plugin: CodeBlockFoldPlugin;

	constructor(app: App, plugin: CodeBlockFoldPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Fold threshold")
			.setDesc("Number of lines after which code blocks will be folded")
			.addSlider((slider) =>
				slider
					.setLimits(3, 20, 1)
					.setValue(this.plugin.settings.foldThreshold)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.foldThreshold = value;
						await this.plugin.saveSettings();
						// 设置修改后立即重新处理所有代码块
						this.plugin.refreshAllCodeBlocks();
					}),
			);
	}
}
