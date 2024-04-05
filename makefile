.PHONY: build
build:
	npm --prefix site run-script build
	cp -r site/build/* internal/server/embed/
	go build -o bin/app cmd/app/main.go