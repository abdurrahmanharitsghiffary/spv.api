interface JWTConfig {
  secret: string;
}

const jwtConfig: JWTConfig = {
  secret: process.env.JWT_SECRET as string,
};

export default jwtConfig;
