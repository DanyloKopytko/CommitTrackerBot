## Development

### Code verification

Enable Eslint and Prettier support in your IDE.

### Model generation

```bash
npx sequelize model:create --name User --attributes name:string,email:string
```

### Migration generation

```bash
npx sequelize migration:generate --name add-password-to-user
```

run `npx sequelize --help` to see more commands
