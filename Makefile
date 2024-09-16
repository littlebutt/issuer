PYTHON :=

HAS_PYTHON := $(shell python --version 2>&1 | grep -q "Python 3" && echo "python" || echo "nopython")

ifeq ($(HAS_PYTHON), python)
	PYTHON := python
else
	@echo "Python 3 required"
	exit -1
endif

NPM :=

HAS_NPM := $(shell hash npm 2>&1 && echo "npm" || echo "nonpm")

ifeq ($(HAS_NPM), npm)
	NPM := npm
else
	@echo "npm required"
	exit -1
endif

init:
	cd ./web && $(NPM) install
	$(PYTHON) -m pip install -r requirements.txt

build-front:
	cd ./web && $(NPM) run build

start:
	$(PYTHON) ./issuer/main.py