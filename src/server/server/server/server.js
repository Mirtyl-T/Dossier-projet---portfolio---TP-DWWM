"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
const rxjs_1 = require("rxjs");
const environment_1 = require("../environments/environment");
let PlayerService = (() => {
    let _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PlayerService = _classThis = class {
        constructor(http) {
            this.http = http;
            this.apiUrl = environment_1.environment.apiUrl;
        }
        // Headers HTTP
        getHeaders() {
            return new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            });
        }
        // Récupérer tous les joueurs
        async getAllPlayers() {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.apiUrl}/players`));
                if (response.success && response.data) {
                    return response.data.map(player => ({
                        ...player,
                        id: player._id
                    }));
                }
                return [];
            }
            catch (error) {
                console.error('Erreur lors de la récupération des joueurs:', error);
                throw error;
            }
        }
        // Récupérer un joueur par ID
        async getPlayerById(id) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.apiUrl}/players/${id}`));
                if (response.success && response.data) {
                    return {
                        ...response.data,
                        id: response.data._id
                    };
                }
                return null;
            }
            catch (error) {
                console.error('Erreur lors de la récupération du joueur:', error);
                return null;
            }
        }
        // Récupérer un joueur par email
        async getPlayerByEmail(email) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.apiUrl}/players/email/${email}`));
                if (response.success && response.data) {
                    return {
                        ...response.data,
                        id: response.data._id
                    };
                }
                return null;
            }
            catch (error) {
                // Si le joueur n'existe pas, retourner null au lieu de throw
                if (error?.status === 404) {
                    return null;
                }
                console.error('Erreur lors de la recherche du joueur:', error);
                throw error;
            }
        }
        // Ajouter un nouveau joueur
        async addPlayer(player) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.post(`${this.apiUrl}/players`, player, {
                    headers: this.getHeaders()
                }));
                if (response.success && response.data) {
                    return response.data._id;
                }
                throw new Error('Erreur lors de la création du joueur');
            }
            catch (error) {
                console.error('Erreur lors de l\'ajout du joueur:', error);
                throw error;
            }
        }
        // Mettre à jour un joueur
        async updatePlayer(id, updates) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.put(`${this.apiUrl}/players/${id}`, updates, {
                    headers: this.getHeaders()
                }));
                if (response.success && response.data) {
                    return {
                        ...response.data,
                        id: response.data._id
                    };
                }
                throw new Error('Erreur lors de la mise à jour du joueur');
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour du joueur:', error);
                throw error;
            }
        }
        // Mettre à jour le score d'un joueur
        async updatePlayerScore(id, won, scoreEarned) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.patch(`${this.apiUrl}/players/${id}/score`, { won, scoreEarned }, { headers: this.getHeaders() }));
                if (response.success && response.data) {
                    return {
                        ...response.data,
                        id: response.data._id
                    };
                }
                throw new Error('Erreur lors de la mise à jour du score');
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour du score:', error);
                throw error;
            }
        }
        // Supprimer un joueur
        async deletePlayer(id) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.delete(`${this.apiUrl}/players/${id}`));
                return response.success;
            }
            catch (error) {
                console.error('Erreur lors de la suppression du joueur:', error);
                throw error;
            }
        }
        // Récupérer le classement (leaderboard)
        async getLeaderboard(limit = 10) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.apiUrl}/leaderboard/top?limit=${limit}`));
                if (response.success && response.data) {
                    return response.data.map(player => ({
                        ...player,
                        id: player._id
                    }));
                }
                return [];
            }
            catch (error) {
                console.error('Erreur lors de la récupération du classement:', error);
                throw error;
            }
        }
        // Tester la connexion à l'API
        async testConnection() {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.apiUrl}/test`));
                return response.success;
            }
            catch (error) {
                console.error('Erreur de connexion à l\'API:', error);
                return false;
            }
        }
    };
    __setFunctionName(_classThis, "PlayerService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PlayerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PlayerService = _classThis;
})();
exports.PlayerService = PlayerService;
