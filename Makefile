# for make
transcendence: all
# we need docker volume for redis and postgres
POSTGRES_VOLUME="./docker-volume/postgres-data"
IMAGE_VOLUME="./docker-volume/image-data"
REDIS_VOLUME="./docker-volume/redis-data"
NGINX_VOLUME="./docker-volume/nginx-data/log"
PGADMIN_VOLUME="./docker-volume/pgadmin-data"

.PHONY: create-volume-directory
create-volume-directory:
	@mkdir -p $(POSTGRES_VOLUME)
	@mkdir -p $(IMAGE_VOLUME)
	@mkdir -p $(REDIS_VOLUME)
	@mkdir -p $(NGINX_VOLUME)
	@mkdir -p $(PGADMIN_VOLUME)

# wait for docker engine start
.PHONY: wait-for-docker
wait-for-docker:
	#@open -g -a docker
	@echo "Waiting for Docker engine to start..."
	@until docker info >/dev/null 2>&1; do sleep 1; done
	@echo "docker engine is started!!"

# up backend containers
.PHONY: backend
backend:
	@make create-volume-directory
	@make wait-for-docker
	@cd backend && docker-compose up -d

.PHONY: all
all:
	@make create-volume-directory
	@make wait-for-docker
	@docker-compose up -d

.PHONY: fclean
fclean:
	@rm -rf $(POSTGRES_VOLUME)
	@rm -rf $(IMAGE_VOLUME)
	@rm -rf $(REDIS_VOLUME)
	@rm -rf $(NGINX_VOLUME)
	@rm -rf $(PGADMIN_VOLUME)

.PHONY: re
re:
	@docker compose down
	@make fclean
	@make create-volume-directory
	@make wait-for-docker
	@docker-compose up -d --build

.PHONY: down
down:
	@docker-compose down