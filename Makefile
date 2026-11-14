# Thin wrappers around the npm scripts; run `make` to list the targets.
# Lớp bọc mỏng quanh các npm script; chạy `make` để xem danh sách target.

.DEFAULT_GOAL := help
.PHONY: help install dev build preview check lint test format verify

help: ## Show this help
	@grep -E '^[a-z]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-10s %s\n", $$1, $$2}'

# Reinstalls only when the lockfile is newer than node_modules.
# Chỉ cài lại khi lockfile mới hơn node_modules.
node_modules: package-lock.json
	npm install
	@touch node_modules

install: node_modules ## Install dependencies

dev: node_modules ## Start the dev server (HMR)
	npm run dev

build: node_modules ## Production build
	npm run build

preview: build ## Build, then preview the production build
	npm run preview

check: node_modules ## Type and a11y checks
	npm run check

lint: node_modules ## Prettier check + ESLint
	npm run lint

test: node_modules ## Unit tests, single run
	npm test

format: node_modules ## Auto-format with Prettier
	npm run format

verify: check lint build ## Definition of done: check, lint, build
