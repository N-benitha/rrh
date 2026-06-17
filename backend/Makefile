PYTHON  = python3
VENV    = venv
PIP     = $(VENV)/bin/pip
PYRUN   = $(VENV)/bin/python

.DEFAULT_GOAL := help

.PHONY: help install migrate seed dev setup

help:
	@echo ""
	@echo "Rwanda Resilience Hub — Backend"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "  install   Create virtualenv and install dependencies"
	@echo "  migrate   Run database migrations"
	@echo "  seed      Seed regions and super admin"
	@echo "  dev       Start development server with hot reload"
	@echo "  setup     Full setup: install + migrate + seed, then start server"
	@echo ""

install:
	@echo ">>> Creating virtual environment..."
	$(PYTHON) -m venv $(VENV)
	@echo ">>> Installing dependencies..."
	$(PIP) install --upgrade pip --quiet
	$(PIP) install -r requirements.txt --quiet
	@echo ">>> Done."

migrate:
	@echo ">>> Running migrations..."
	$(PYRUN) -m alembic upgrade head
	@echo ">>> Done."

seed:
	@echo ">>> Seeding regions..."
	$(PYRUN) -m app.seed
	@echo ">>> Seeding super admin..."
	$(PYRUN) -m app.seeds.seed_admin

dev:
	@echo ">>> Starting development server..."
	$(PYRUN) -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

setup: install migrate seed dev
