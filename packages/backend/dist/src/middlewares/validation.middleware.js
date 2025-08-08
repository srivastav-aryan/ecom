const validateReq = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            querry: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        next(error);
    }
};
export {};
