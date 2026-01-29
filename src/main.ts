import { Plugin, Notice } from "obsidian";
import {
	DEFAULT_SETTINGS,
	CodeBlockFoldSettings,
	CodeBlockFoldSettingTab,
} from "./settings";

export default class CodeBlockFoldPlugin extends Plugin {
	settings: CodeBlockFoldSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new CodeBlockFoldSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((element) => {
			const codeBlocks = element.querySelectorAll("pre");
			codeBlocks.forEach((pre) => {
				this.processCodeBlock(pre);
			});
		});
	}

	processCodeBlock(pre: HTMLElement): void {
		const codeEl = pre.querySelector("code");
		if (!codeEl) return;

		const lines = codeEl.textContent?.split("\n") || [];
		const lineCount = lines.length;
		const foldThreshold = this.settings.foldThreshold;

		const header = pre.querySelector(".code-block-fold-header");
		if (header) return;

		const headerEl = pre.createDiv({ cls: "code-block-fold-header" });

		// Extract language from code element class
		const language = this.extractLanguage(codeEl);
		const langEl = headerEl.createSpan({ cls: "code-block-language" });
		langEl.setText(this.capitalizeLanguage(language) || "Code");

		// Create buttons container
		const buttonsContainer = headerEl.createDiv({ cls: "code-block-fold-buttons" });

		// Store fold button reference for header click handler
		let foldBtn: HTMLElement | null = null;

		if (lineCount > foldThreshold) {
			foldBtn = buttonsContainer.createEl("button", {
				cls: "code-block-fold-btn",
				attr: {
					"aria-label": "Toggle fold",
					"data-tooltip-position": "top",
				},
			});
			foldBtn.setText("▼");

			pre.classList.add("code-block-folded");
			pre.style.setProperty("--fold-threshold", String(foldThreshold + 1));

			// Add fold info element
			const foldInfoEl = pre.createDiv({ cls: "code-block-fold-info" });
			const remainingLines = lineCount - foldThreshold - 1;
			foldInfoEl.setText(`还有 ${remainingLines} 行代码被折叠`);

			// Update fold info visibility on toggle
			const updateFoldInfo = () => {
				const isFolded = pre.classList.contains("code-block-folded");
				foldInfoEl.style.display = isFolded ? "block" : "none";
			};

			// Override toggleFold to update fold info
			const originalToggle = this.toggleFold.bind(this);
			this.toggleFold = (pre: HTMLElement, foldBtn: HTMLElement) => {
				originalToggle(pre, foldBtn);
				updateFoldInfo();
			};

			this.registerDomEvent(foldBtn, "click", (e) => {
				e.stopPropagation();
				this.toggleFold(pre, foldBtn!);
			});

			foldBtn.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					foldBtn!.click();
				}
			});

			// Add click handler to header for folding
			this.registerDomEvent(headerEl, "click", (e) => {
				// Only toggle if clicking on the header itself or language label, not buttons
				if (e.target === headerEl || e.target === langEl) {
					this.toggleFold(pre, foldBtn!);
				}
			});
		}

		const copyBtn = buttonsContainer.createEl("button", {
			cls: "code-block-copy-btn",
			attr: {
				"aria-label": "Copy code",
				"data-tooltip-position": "top",
			},
		});
		copyBtn.setText("📋");

		this.registerDomEvent(copyBtn, "click", async (e) => {
			e.stopPropagation();
			const code = codeEl.textContent || "";
			try {
				await navigator.clipboard.writeText(code);
				new Notice("Copied to clipboard");
			} catch {
				new Notice("Failed to copy");
			}
		});

		copyBtn.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				copyBtn.click();
			}
		});

		pre.insertBefore(headerEl, pre.firstChild);
	}

	extractLanguage(codeEl: Element): string | null {
		const classList = codeEl.className.split(" ");
		for (const cls of classList) {
			if (cls.startsWith("language-")) {
				return cls.replace("language-", "");
			}
		}
		return null;
	}

	capitalizeLanguage(language: string | null): string | null {
		if (!language) return null;
		return language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
	}

	toggleFold(pre: HTMLElement, foldBtn: HTMLElement): void {
		const isFolded = pre.classList.contains("code-block-folded");
		if (isFolded) {
			pre.classList.remove("code-block-folded");
			foldBtn.setText("▲");
			foldBtn.setAttribute("aria-label", "Collapse");
		} else {
			pre.classList.add("code-block-folded");
			foldBtn.setText("▼");
			foldBtn.setAttribute("aria-label", "Expand");
		}
	}

	async loadSettings() {
		const data: unknown = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data as Partial<CodeBlockFoldSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 刷新所有代码块，用于设置修改后重新应用
	refreshAllCodeBlocks(): void {
		// 获取所有已处理的代码块，移除header并重新处理
		const processedBlocks = document.querySelectorAll('pre:has(.code-block-fold-header)');
		processedBlocks.forEach((pre) => {
			const header = pre.querySelector('.code-block-fold-header');
			if (header) {
				header.remove();
			}
			const foldInfo = pre.querySelector('.code-block-fold-info');
			if (foldInfo) {
				foldInfo.remove();
			}
			// 移除折叠相关的类和样式
			pre.classList.remove('code-block-folded');
			(pre as HTMLElement).style.removeProperty('--fold-threshold');
		});

		// 重新处理所有代码块
		const allCodeBlocks = document.querySelectorAll('pre');
		allCodeBlocks.forEach((pre) => {
			// 检查是否包含 code 元素且尚未处理
			if (pre.querySelector('code') && !pre.querySelector('.code-block-fold-header')) {
				this.processCodeBlock(pre as HTMLElement);
			}
		});
	}
}
