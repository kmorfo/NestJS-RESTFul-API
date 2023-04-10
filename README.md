<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Documentación de NestJS y TypeORM
[NestJS Documentation](https://docs.nestjs.com/)
\
[TypeORM GitBook](https://orkhan.gitbook.io/typeorm/)
\
[TypeORM Documentation](https://typeorm.io/)

# Teslo API
1. Clonar repositorio
2. ```yarn install```
3. Clonar el archivo `.env.template` y renombrarlo a `.env`
4. Configurar las variables de entorno según nuestros parametros
5. Levantar la base de datos
```
docker-compose up -d
```
6. Levantar: 
```
yarn start:dev
```
7. Ejecutar __SEED__ para cargar valores en la BD
```
http://localhost:3000/api/seed
```
8. Documentación con OpenAPI
```
http://localhost:3000/api/
```
9. Documentación con 