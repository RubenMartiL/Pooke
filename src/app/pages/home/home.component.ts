import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, QueryList, ViewChildren, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { environment } from 'src/environments/environment';
import { environment as environmentProd } from 'src/environments/environment.prod';
import { ChatGptApiService } from 'src/services/chat-gpt-api.service';

type PokemonType = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';
type TypeEffectiveness = Record<any, Record<any, number>>;

const tablaEfectividades: TypeEffectiveness = {
  "normal": { "normal": 1, "fire": 1, "water": 1, "electric": 1, "grass": 1, "ice": 1, "fighting": 1, "poison": 1, "ground": 1, "flying": 1, "psychic": 1, "bug": 1, "rock": 0.5, "ghost": 0, "dragon": 1, "dark": 1, "steel": 0.5, "fairy": 1 },
  "fire": { "normal": 1, "fire": 0.5, "water": 0.5, "electric": 1, "grass": 2, "ice": 2, "fighting": 1, "poison": 1, "ground": 1, "flying": 1, "psychic": 1, "bug": 2, "rock": 0.5, "ghost": 1, "dragon": 0.5, "dark": 1, "steel": 2, "fairy": 1 },
  "water": { "normal": 1, "fire": 2, "water": 0.5, "electric": 1, "grass": 0.5, "ice": 1, "fighting": 1, "poison": 1, "ground": 2, "flying": 1, "psychic": 1, "bug": 1, "rock": 2, "ghost": 1, "dragon": 0.5, "dark": 1, "steel": 1, "fairy": 1 },
  "electric": { "normal": 1, "fire": 1, "water": 2, "electric": 0.5, "grass": 0.5, "ice": 1, "fighting": 1, "poison": 1, "ground": 0, "flying": 2, "psychic": 1, "bug": 1, "rock": 1, "ghost": 1, "dragon": 0.5, "dark": 1, "steel": 1, "fairy": 1 },
  "grass": { "normal": 1, "fire": 0.5, "water": 2, "electric": 1, "grass": 0.5, "ice": 1, "fighting": 1, "poison": 0.5, "ground": 2, "flying": 0.5, "psychic": 1, "bug": 0.5, "rock": 2, "ghost": 1, "dragon": 0.5, "dark": 1, "steel": 0.5, "fairy": 1 },
  "ice": { "normal": 1, "fire": 0.5, "water": 0.5, "electric": 1, "grass": 2, "ice": 0.5, "fighting": 2, "poison": 1, "ground": 2, "flying": 2, "psychic": 1, "bug": 1, "rock": 1, "ghost": 1, "dragon": 2, "dark": 1, "steel": 0.5, "fairy": 1 },
  "fighting": { "normal": 2, "fire": 1, "water": 1, "electric": 1, "grass": 1, "ice": 2, "fighting": 1, "poison": 0.5, "ground": 1, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "ghost": 0, "dragon": 1, "dark": 2, "steel": 2, "fairy": 0.5 },
  "poison": { "normal": 1, "fire": 1, "water": 1, "electric": 1, "grass": 2, "ice": 1, "fighting": 1, "poison": 0.5, "ground": 0.5, "flying": 1, "psychic": 1, "bug": 1, "rock": 0.5, "ghost": 0.5, "dragon": 1, "dark": 1, "steel": 0, "fairy": 2 },
  "ground": { "normal": 1, "fire": 2, "water": 1, "electric": 2, "grass": 0.5, "ice": 1, "fighting": 1, "poison": 2, "ground": 1, "flying": 0, "psychic": 1, "bug": 0.5, "rock": 2, "ghost": 1, "dragon": 1, "dark": 1, "steel": 2, "fairy": 1 },
  "flying": { "normal": 1, "fire": 1, "water": 1, "electric": 0.5, "grass": 2, "ice": 1, "fighting": 2, "poison": 1, "ground": 1, "flying": 1, "psychic": 1, "bug": 2, "rock": 0.5, "ghost": 1, "dragon": 1, "dark": 1, "steel": 0.5, "fairy": 1 },
  "psychic": { "normal": 1, "fire": 1, "water": 1, "electric": 1, "grass": 1, "ice": 1, "fighting": 2, "poison": 2, "ground": 1, "flying": 1, "psychic": 0.5, "bug": 1, "rock": 1, "ghost": 1, "dragon": 1, "dark": 0, "steel": 0.5, "fairy": 1 },
  "bug": { "normal": 1, "fire": 0.5, "water": 1, "electric": 1, "grass": 2, "ice": 1, "fighting": 0.5, "poison": 0.5, "ground": 1, "flying": 0.5, "psychic": 2, "bug": 1, "rock": 1, "ghost": 0.5, "dragon": 1, "dark": 2, "steel": 0.5, "fairy": 0.5 },
  "rock": { "normal": 1, "fire": 2, "water": 1, "electric": 1, "grass": 1, "ice": 2, "fighting": 0.5, "poison": 1, "ground": 0.5, "flying": 2, "psychic": 1, "bug": 2, "rock": 1, "ghost": 1, "dragon": 1, "dark": 1, "steel": 0.5, "fairy": 1 },
  "ghost": { "normal": 0, "fire": 1, "water": 1, "electric": 1, "grass": 1, "ice": 1, "fighting": 1, "poison": 1, "ground": 1, "flying": 1, "psychic": 2, "bug": 1, "rock": 1, "ghost": 2, "dragon": 1, "dark": 0.5, "steel": 1, "fairy": 1 },
  "dragon": { "normal": 1, "fire": 0.5, "water": 0.5, "electric": 0.5, "grass": 0.5, "ice": 2, "fighting": 1, "poison": 1, "ground": 1, "flying": 1, "psychic": 1, "bug": 1, "rock": 1, "ghost": 1, "dragon": 2, "dark": 1, "steel": 0.5, "fairy": 2 },
  "dark": { "normal": 1, "fire": 1, "water": 1, "electric": 1, "grass": 1, "ice": 1, "fighting": 0.5, "poison": 1, "ground": 1, "flying": 1, "psychic": 2, "bug": 1, "rock": 1, "ghost": 2, "dragon": 1, "dark": 0.5, "steel": 1, "fairy": 0.5 },
  "steel": { "normal": 1, "fire": 0.5, "water": 0.5, "electric": 0.5, "grass": 1, "ice": 2, "fighting": 1, "poison": 1, "ground": 1, "flying": 1, "psychic": 1, "bug": 1, "rock": 2, "ghost": 1, "dragon": 1, "dark": 1, "steel": 0.5, "fairy": 2 },
  "fairy": { "normal": 1, "fire": 0.5, "water": 1, "electric": 1, "grass": 1, "ice": 1, "fighting": 2, "poison": 0.5, "ground": 1, "flying": 1, "psychic": 1, "bug": 1, "rock": 1, "ghost": 1, "dragon": 2, "dark": 2, "steel": 0.5, "fairy": 1 }
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  baseUrl = (environment.production) ? environmentProd.baseUrl : environment.baseUrl;
  backendUrl = (environment.production) ? environmentProd.backendUrl : environment.backendUrl;

  userLoged: any;
  pokemonList: Array<any> = [];
  listadoPokemonsUsuarios: Array<any> = [];
  equipoPokemonsUsuarios: Array<any> = [];

  activeSection: string = 'home';

  // OAK //
  homeMessageNoTeam: boolean = false;

  // POKEDEX //
  pokedexInputSearch: string = '';
  pokedexList: Array<any> = [];
  pokedexCargada: boolean = false;
  pokedexTipos: Array<any> = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  pokedexTiposSelected: Array<any> = [];

  // POKEMON DATOS
  pokemonDatos: any = '';
  pokemonDatosBase: any = '';
  pokemonListadoPokemonsRepetidos: Array<any> = [];
  pokemonDatosSelected: number = -1;
  pokemonDatosStatsChart: any;
  pokemonDatosStatsChartGenerated: boolean = false;
  pokemonDatosMoves: Array<any> = [];
  pokemonDatosLastSection: string = '';

  // TEAM
  pokemonTeam: any = '';
  pokemonBanquillo: Array<any> = [];
  pokemonTeam_draggedValue: any = '';
  pokemonTeam_draggedIndex: number = -1;
  dragObject: any;
  dragIndex: number = -1;
  dragStartPosition: any;
  originalArray: any[] = [];
  teamPestanya: string = 'abierta'

  // SHOP //
  pokeballOpening = false;
  shopPokemon: any;
  shopOpening: boolean = false;

  // BATTLE //
  inBattle: boolean = false;
  battle_yourTeam: Array<any> = [];
  battle_enemyTeam: Array<any> = [];
  battle_turn: number = 1;
  battle_turn_player: string = '';
  battle_turn_choose: boolean = true;
  battle_menu: string = 'principal';
  battle_menu_show: boolean = true;
  battle_your_pokemon: any = 0;
  battle_your_pokemon_moves: Array<any> = [];
  battle_your_pokemon_movement: any = '';
  battle_your_pokemon_move: any = '';
  battle_your_pokemon_modification: number = 1;
  battle_your_pokemon_randomModifier: number = 1;
  battle_your_pokemon_animation = 'wait';
  battle_enemy_pokemon: any = 0;
  battle_enemy_pokemon_movement: any = '';
  battle_enemy_pokemon_move: any = '';
  battle_enemy_pokemon_moves: Array<any> = [];
  battle_enemy_pokemon_animation = '';
  battle_damage: Array<number> = [];
  battle_damage_width: number = 0;
  battle_health_width: number = 0;
  battle_damageDrain_width: number = 0;
  battle_lastMovement: any = '';
  battle_messages: string = '';
  battle_priority: string = '';
  battleEndTurn: boolean = false;
  battleResult: string = '';
  battle_enemyTeamPrincipio: number = 0;
  battle_movement_healing = 0
  battle_movement_drain: Array<number> = [];
  backgroundStyle: any;
  battleMessagesLetterByLetterInUse: boolean = false;
  messageQueue: string[] = [];
  @ViewChildren('combatTooltips') combatTooltips: ElementRef[] = [];;

  /* MOVIL VERSION */
  movil: boolean = false;
  correctOrientation: boolean = false;

  constructor(private chatgpt: ChatGptApiService, private elementRef: ElementRef, private renderer: Renderer2, private router: Router) {
    if (!localStorage.getItem("login")) {
      this.router.navigate([this.baseUrl + '']);
    }
    const loginData = localStorage.getItem('login');
    if (loginData !== null) {
      this.userLoged = JSON.parse(loginData);
    } else {
      this.userLoged = '';
    }
  }

  async ngOnInit() {
    this.doMobileVersion();
    //console.log('environment.production:', environment.production);
    //console.log('baseUrl:', this.baseUrl);
    await this.setAllPokemons();
    await this.setUserPokemons();
    await this.getUserTeam();
    await this.getUserBanquillo();
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event: Event) {
    this.doMobileVersion();
  }

  doMobileVersion = () => {
    if (/Mobi/.test(navigator.userAgent)) {
      this.movil = true;
      const mediaQuery = window.matchMedia('(orientation: portrait)');
      if (mediaQuery.matches) {
        this.correctOrientation = false;
      } else {
        this.correctOrientation = true;
      }
    } else {
      this.movil = false;
    }
  }

  setAllPokemons = async () => {
    this.pokedexCargada = false;
    const pokemonList: Array<any> = [];
    const urls = ['https://pokeapi.co/api/v2/pokemon?limit=151&offset=0'];
    const fetchPromises = urls.map(async (url) => {
      const response = await fetch(url);
      const data = await response.json();
      const pokemonDetailsPromises = data.results.map(async (pokemon: any) => {
        const pokemonDetails = await this.getPokemonByUrl(pokemon.url);
        return pokemonDetails;
      });
      const pokemonDetails = await Promise.all(pokemonDetailsPromises);
      pokemonList.push(...pokemonDetails);
    });
    await Promise.all(fetchPromises);
    this.pokemonList = pokemonList;
    this.pokedexList = pokemonList;
    console.log('Cargado -> setAllPokemons');
  }

  setUserPokemons = async () => {
    this.pokedexCargada = false;
    const urls = [this.backendUrl + 'getUserPokemons.php'];
    const fetchPromises = urls.map(async (url) => {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
      const data = await response.json();
      if (data != false) {
        const pokemonDetailsPromises = data.map(async (pokemon: any) => {
          const pokemonDetails = this.listadoPokemonsUsuarios.push(pokemon);
          return pokemonDetails;
        });
        const pokemonDetails = await Promise.all(pokemonDetailsPromises);
      }
    });
    await Promise.all(fetchPromises);
    console.log('Cargado -> setUserPokemons');
    this.pokedexCargada = true;
  }

  getUserTeam = async () => {
    this.pokedexCargada = false;
    let userTeam: Array<any> = [];
    const urls = [this.backendUrl + 'getUserTeam.php'];
    const fetchPromises = urls.map(async (url) => {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
      const data = await response.json();
      const pokemonDetailsPromises = data.map(async (pokemon: any) => {
        const pokemonDetails = await this.getUserPokemonById(pokemon.id_pokemon);
        return pokemonDetails;
      });
      const pokemonDetails = await Promise.all(pokemonDetailsPromises);
      pokemonDetails.forEach(pokemon => { userTeam.push(pokemon[0]) })
    });
    await Promise.all(fetchPromises);
    userTeam.sort((a, b) => a.position - b.position)
    userTeam.forEach(async (pokemon) => {
      let newPokemon = await this.getPokemonById(pokemon.id_pokemon)
      this.equipoPokemonsUsuarios.push(this.getFusionPokemons(newPokemon, pokemon));
    })
    console.log('Cargado -> getUserTeam');
  }

  getUserBanquillo = async () => {
    let userBanquillo: Array<any> = [];
    const urls = [this.backendUrl + 'getUserPokemons.php'];
    const fetchPromises = urls.map(async (url) => {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
      const data = await response.json();
      return data;
    });
    await Promise.all(fetchPromises)
      .then(data => {
        if (data[0] != false) {
          data[0].forEach(async (pokemon: any) => {
            const response = await fetch(this.backendUrl + 'getUserTeam.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
            const data = await response.json();
            let pokemonEsta = data.find((pokemonEncontrado: any) => pokemon.id == pokemonEncontrado.id_pokemon);
            if (!pokemonEsta) {
              let pokemonApi = await this.getPokemonById(pokemon.id_pokemon);
              this.pokemonBanquillo.push(this.getFusionPokemons(pokemonApi, pokemon));
            }
          })
        }
        this.pokedexCargada = true;
        console.log('Cargado -> getUserBanquillo');
      })
  }

  getPokemonById = async (idPokemon: number) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idPokemon}`);
    const data = await response.json();
    return data;
  }

  getPokemonByUrl = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    this.pokemonDatos = data;
    return data;
  }

  getUserPokemonById = async (idPokemon: number) => {
    const response = await fetch(this.backendUrl + `getUserPokemonById.php`, { method: 'POST', body: JSON.stringify({ 'id': idPokemon }) });
    const data = await response.json();
    return data;
  }

  closeOakHome = (oak: number) => {
    document.getElementsByClassName('oak_image')[oak].classList.add("oakOut");
    document.getElementsByClassName('oak_background')[oak].classList.add("oakOut");
    setTimeout(() => {
      this.homeMessageNoTeam = false;
    }, 1000);
  }

  setSection = async (seccion: string) => {
    if (this.equipoPokemonsUsuarios.length > 0 && seccion == 'battle') {
      this.activeSection = seccion;
      this.battle();
    } else {
      if (this.equipoPokemonsUsuarios.length <= 0 && seccion == 'battle') {
        this.homeMessageNoTeam = true;
      } else {
        this.activeSection = seccion;
      }
    }

    if (seccion == 'equipo') {
      this.listadoPokemonsUsuarios = [];
      this.equipoPokemonsUsuarios = [];
      this.pokemonBanquillo = [];

      await this.setUserPokemons();
      await this.getUserTeam();
      await this.getUserBanquillo();
    }

    if (seccion == 'home') {
      this.teamPestanya = 'abierta'
      let minBackground = 1;
      let maxBackground = 10;
      let randomBackground = Math.floor(Math.random() * (maxBackground - minBackground + 1)) + minBackground;
      this.backgroundStyle = `url('${this.baseUrl}/pokemon/assets/media/battleBackgrounds/${randomBackground}.png')`;
    }

    if (seccion == 'pokedex') {
      this.listadoPokemonsUsuarios = [];
      await this.setUserPokemons();
    }
  }

  formatIdPokemonPokedex = (id: number) => {
    let number = '';
    if (id >= 10 && id < 100) { number += '0'; }
    else if (id < 10) { number += '00'; }
    number += id;
    return number
  }

  formatNamePokemonPokedex = (name: string) => {
    let pokemonName = '';
    for (let letra = 0; letra < name.length; letra++) {
      if (letra == 0) { pokemonName += name[letra].toUpperCase(); }
      else { pokemonName += name[letra]; }
    }
    return pokemonName;
  }

  comprobarPokemonCaptured = (pokemonId: number) => {
    let returnValue = false
    this.listadoPokemonsUsuarios.forEach(pokemon => {
      if (pokemon.id_pokemon == pokemonId) {
        returnValue = true;
      }
    })
    return returnValue;
  }

  pokedexFilterSearch = (tipo?: string) => {
    this.pokedexList = this.pokemonList;
    let mostrarTipo = false;
    let mostrarNombre = false;
    let mostrarCaptured = false;
    let newPokedexList: Array<any> = [];
    if (tipo != null && this.pokedexTiposSelected.indexOf(tipo) != -1) {
      this.pokedexTiposSelected.splice(this.pokedexTiposSelected.indexOf(tipo), 1);
    } else if (tipo != null) {
      this.pokedexTiposSelected.push(tipo);
    }
    this.pokedexList.forEach(pokemon => {
      pokemon.types.forEach((tipoPokemon: any) => {
        if (this.pokedexTiposSelected.includes(tipoPokemon.type.name)) { mostrarTipo = true; }
      })
      if (pokemon.name.includes(this.pokedexInputSearch.toLowerCase())) { mostrarNombre = true; }
      if (this.comprobarPokemonCaptured(pokemon.id)) { mostrarCaptured = true; }
      if (this.pokedexTiposSelected.length <= 0) { mostrarTipo = true }
      if (mostrarNombre && mostrarTipo) { newPokedexList.push(pokemon); }
      mostrarTipo = false;
      mostrarNombre = false;
      mostrarCaptured = false;
    })
    this.pokedexList = newPokedexList;
  }

  getBackground = () => {
    return this.backgroundStyle;
  }

  battle = async () => {
    this.messageQueue = [];
    this.inBattle = false;
    this.battle_menu_show = false;
    this.pokedexCargada = false;
    this.battle_enemyTeam = [];
    this.battle_yourTeam = [];
    this.battle_your_pokemon = '';
    this.battle_enemy_pokemon = '';
    this.battle_your_pokemon_moves = [];
    this.battle_enemy_pokemon_moves = [];
    this.battle_your_pokemon_animation = 'idle';
    this.battle_enemy_pokemon_animation = 'idle';
    this.battle_your_pokemon_movement = '';
    this.battle_your_pokemon_move = '';
    this.battle_enemy_pokemon_movement = '';
    this.battle_enemy_pokemon_move = '';
    this.battle_menu = 'principal';
    this.battle_enemyTeamPrincipio = 0;

    this.equipoPokemonsUsuarios.forEach(pokemon => {
      this.battle_yourTeam.push(this.getInBattlePokemon(pokemon));
    })

    let totalNiveles = 0;
    for (let i = 0; i < this.battle_yourTeam.length; i++) {
      totalNiveles += Number(this.battle_yourTeam[i].unique.lvl);
    }
    let nivelMedio = Math.floor(totalNiveles / this.battle_yourTeam.length);

    let min = this.equipoPokemonsUsuarios.length - 1;
    let max = this.equipoPokemonsUsuarios.length + 1;
    let randomIntegrantes = Math.floor(Math.random() * (max - min + 1)) + min;
    if (randomIntegrantes <= 0) { randomIntegrantes = 1; }
    if (randomIntegrantes >= 7) { randomIntegrantes = 6; }
    this.battle_enemyTeamPrincipio = randomIntegrantes;
    min = nivelMedio - 2;
    if (min <= 0) { min = 1; }
    max = nivelMedio + 2;
    if (max >= 100) { max = 99; }
    const randomLvl = Math.floor(Math.random() * (max - min + 1)) + min;
    for (let i = 0; i < randomIntegrantes; i++) {
      const pokemonRandom = await this.generadorDePokemonsAleatorios();
      let arrayMoves: Array<number> = [];
      if (pokemonRandom.moves.length > 4) {
        if (pokemonRandom.moves.length > 10) {
          while (arrayMoves.length < 4) {
            let random = Math.floor(Math.random() * 10 + 1);
            const responseMove = await fetch(pokemonRandom.moves[random].move.url);
            const dataMove = await responseMove.json();
            !arrayMoves.includes(dataMove.id) ? arrayMoves.push(dataMove.id) : null;
          }
        } else {
          while (arrayMoves.length < 4) {
            let random = Math.floor(Math.random() * pokemonRandom.moves.length);
            const responseMove = await fetch(pokemonRandom.moves[random].move.url);
            const dataMove = await responseMove.json();
            !arrayMoves.includes(dataMove.id) ? arrayMoves.push(dataMove.id) : null;
          }
        }
      } else if (pokemonRandom.moves.length == 4) {
        for (let i = 0; i < 4; i++) {
          const responseMove = await fetch(pokemonRandom.moves[i].move.url);
          const dataMove = await responseMove.json();
          arrayMoves.push(dataMove.id);
        }
      } else {
        const responseMove = await fetch(pokemonRandom.moves[0].move.url);
        const dataMove = await responseMove.json();
        arrayMoves.push(dataMove.id);
        arrayMoves.push(dataMove.id);
        arrayMoves.push(dataMove.id);
        arrayMoves.push(dataMove.id);
      }
      const newPokemon = {
        id_pokemon: pokemonRandom.id,
        ivs_attack_pokemon: "0",
        ivs_defense_pokemon: "0",
        ivs_ps_pokemon: "0",
        ivs_sattack_pokemon: "0",
        ivs_sdefense_pokemon: "0",
        ivs_speed_pokemon: "0",
        lvl_pokemon: randomLvl,
        move_four: arrayMoves[3],
        move_one: arrayMoves[0],
        move_three: arrayMoves[2],
        move_two: arrayMoves[1],
        name_pokemon: null,
        naturaleza: "1",
      }
      const fusionPokemon = this.getFusionPokemons(pokemonRandom, newPokemon);
      const battlePokemon = this.getInBattlePokemon(fusionPokemon);
      this.battle_enemyTeam.push(battlePokemon)
    }
    this.battle_your_pokemon = this.battle_yourTeam[0];
    this.battle_enemy_pokemon = this.battle_enemyTeam[0];

    // Para dibujar los movimientos del Pokemon en el menu
    this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_one));
    this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_two));
    this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_three));
    this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_four));

    this.battle_your_pokemon_moves[0].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[0])
    this.battle_your_pokemon_moves[1].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[1])
    this.battle_your_pokemon_moves[2].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[2])
    this.battle_your_pokemon_moves[3].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[3])

    this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_one));
    this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_two));
    this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_three));
    this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_four));
    /*
    this.chatgpt.resetSession();
    let responseChatGPT = await this.chatgpt.getResponse(this.getPrompt("first"));
    console.log(responseChatGPT.choices[0].message.content);
    responseChatGPT = await this.chatgpt.getResponse(this.getPrompt("pass_context"));
    console.log(responseChatGPT.choices[0].message.content);
    */

    this.inBattle = true;
    this.battle_menu_show = true;
    setTimeout(() => {
      this.pokedexCargada = true;
    }, 2000);

    /*
    // PASAMOS CONTEXTO A CHAT GPT
    let responseChatGPT = await this.chatgpt.getResponse(this.getPrompt("player-attack-context"));
    let accionEncontrada = responseChatGPT.choices[0].message.content.match(/\d+/);
    accionEncontrada -= 1;
    // TURNO ENEMIGO CAMBIAR LUEGO
    this.setBattleMovement('move',this.battle_enemy_pokemon_moves[accionEncontrada],'enemy');
    */

    this.battleMessagesLetterByLetter(`¿Que deberia hacer ${this.formatNamePokemonPokedex(this.battle_your_pokemon.name)}?`)
  }

  battleTurn = async () => {
    let min = 0;
    let max = 3;
    let randomMove = Math.floor(Math.random() * (max - min + 1)) + min;
    this.setBattleMovement('move', this.battle_enemy_pokemon_moves[randomMove], 'enemy');

    this.battleEndTurn = false;
    // VARIABLE NECESARIA PARA ESPERAR LOS MOVES
    let hits: number = -1;
    // CALCULAMOS LA PRIORIDAD DESPUES DE QUE ESCOGAN AMBOS
    this.battleCalculationPriority();
    // APLICAMOS MOVIMIENTOS
    //if(this.battle_priority == 'your'){
    this.battle_turn_player = 'your';
    if (this.battle_your_pokemon_movement == 'move') {
      hits = await this.battleCalculationMove(this.battle_your_pokemon, this.battle_enemy_pokemon, this.battle_your_pokemon_move); // SI USAS MOVE VS ENEMIGO
      setTimeout(async () => {
        if (this.battle_your_pokemon.battleStats.actual.ps <= 0 || this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
          await this.battleDie();
          this.battleNextTurn();
          return
        }
        this.battle_turn_player = 'enemy';
        if (this.battle_enemy_pokemon_movement == 'move') {
          hits = await this.battleCalculationMove(this.battle_enemy_pokemon, this.battle_your_pokemon, this.battle_enemy_pokemon_move); // SI USAS MOVE VS ENEMIGO
          setTimeout(async () => {
            if (this.battle_your_pokemon.battleStats.actual.ps <= 0 || this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
              await this.battleDie();
              this.battleNextTurn();
              return
            }
            if (this.battle_priority == 'your') { this.battle_turn_player = 'your'; this.battleCalculationAilment(this.battle_enemy_pokemon); }
            else { this.battle_turn_player = 'enemy'; this.battleCalculationAilment(this.battle_your_pokemon); }
            this.battleNextTurn();
          }, 3350 * hits)

        } else {
          this.setBattleChangePokemon('enemy', this.battle_enemy_pokemon_move); // SI CAMBIAS DE POKEMON
          setTimeout(async () => {
            if (this.battle_priority == 'your') { this.battle_turn_player = 'your'; this.battleCalculationAilment(this.battle_enemy_pokemon); }
            else { this.battle_turn_player = 'enemy'; this.battleCalculationAilment(this.battle_your_pokemon); }
            if (this.battle_your_pokemon.battleStats.actual.ps <= 0 || this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
              await this.battleDie();
              this.battleNextTurn();
              return
            }
            this.battleNextTurn();
          }, 3350 * 1)
        }
      }, 3350 * hits)
    } else {
      this.setBattleChangePokemon('your', this.battle_your_pokemon_move); // SI CAMBIAS DE POKEMON
      setTimeout(async () => {
        this.battle_turn_player = 'enemy';
        if (this.battle_enemy_pokemon_movement == 'move') {
          hits = await this.battleCalculationMove(this.battle_enemy_pokemon, this.battle_your_pokemon, this.battle_enemy_pokemon_move); // SI USAS MOVE VS ENEMIGO
          setTimeout(async () => {
            if (this.battle_your_pokemon.battleStats.actual.ps <= 0 || this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
              await this.battleDie();
              this.battleNextTurn();
              return
            }
            if (this.battle_priority == 'your') { this.battle_turn_player = 'your'; this.battleCalculationAilment(this.battle_enemy_pokemon); }
            else { this.battle_turn_player = 'enemy'; this.battleCalculationAilment(this.battle_your_pokemon); }
            if (this.battle_your_pokemon.battleStats.actual.ps <= 0 || this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
              this.battleEndTurn = true;
              await this.battleDie();
              this.battleNextTurn();
              return
            }
            this.battleNextTurn();
          }, 3350 * hits)

        } else {
          this.setBattleChangePokemon('enemy', this.battle_enemy_pokemon_move); // SI CAMBIAS DE POKEMON
          setTimeout(async () => {
            if (this.battle_priority == 'your') { this.battle_turn_player = 'your'; this.battleCalculationAilment(this.battle_enemy_pokemon); }
            else { this.battle_turn_player = 'enemy'; this.battleCalculationAilment(this.battle_your_pokemon); }
            if (this.battle_your_pokemon.battleStats.actual.ps <= 0 || this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
              await this.battleDie();
              this.battleNextTurn();
              return
            }
            this.battleNextTurn();
          }, 3350 * 1)
        }
      }, 3350 * 1)
    }

    //}else{
    // LO DE ARRIBA AL REVES
    //}
  }

  setBattleMenu = (section: string) => {
    this.battle_menu = section;
  }

  setBattleMovement = (moveType: any, moveObject: any, person: any) => {
    if (person == 'your') {
      this.battle_your_pokemon_movement = moveType;
      this.battle_your_pokemon_move = moveObject;
      this.battle_turn_choose = false;
      this.battleTurn();
    } else {
      this.battle_enemy_pokemon_movement = moveType;
      this.battle_enemy_pokemon_move = moveObject;
    }
  }

  getPokedexBgColor = (pokemon: any) => {
    let tipo = '';
    let opacity = 0;
    if (pokemon.types) { tipo = pokemon.types[0].type.name; opacity = 0.5; }
    else { tipo = pokemon.type.name; opacity = 0.8 }
    switch (tipo) {
      case 'fighting': return `rgba(206,63,106,${opacity})`;
      case 'psychic': return `rgba(249,112,119,${opacity})`;
      case 'poison': return `rgba(167,106,201,${opacity})`;
      case 'dragon': return `rgba(9,109,195,${opacity})`;
      case 'ghost': return `rgba(82,105,172,${opacity})`;
      case 'dark': return `rgba(90,83,101,${opacity})`;
      case 'ground': return `rgba(217,119,70,${opacity})`;
      case 'fire': return `rgba(254,156,83,${opacity})`;
      case 'fairy': return `rgba(236,144,231,${opacity})`;
      case 'water': return `rgba(76, 144, 213,${opacity})`;
      case 'flying': return `rgba(143, 168, 222,${opacity})`;
      case 'normal': return `rgba(141, 154, 164,${opacity})`;
      case 'rock': return `rgba(200, 183, 139,${opacity})`;
      case 'electric': return `rgba(244, 219, 59,${opacity})`;
      case 'bug': return `rgba(144, 192, 44,${opacity})`;
      case 'grass': return `rgba(100, 187, 92,${opacity})`;
      case 'ice': return `rgba(115, 206, 191,${opacity})`;
      case 'steel': return `rgba(87, 144, 161,${opacity})`;
      default: return '#000';
    }
  }

  getPokemonDatosStatFill = (stat: number) => {
    if (this.pokemonDatos.stats[stat].base_stat > 80) {
      return ((this.pokemonDatos.stats[stat].base_stat * 100) / (this.pokemonDatos.stats[stat].base_stat + (100 * 3)));
    }
    else if (this.pokemonDatos.stats[stat].base_stat > 50) {
      return ((this.pokemonDatos.stats[stat].base_stat * 100) / (this.pokemonDatos.stats[stat].base_stat + (100 * 2)));
    }
    else {
      return ((this.pokemonDatos.stats[stat].base_stat * 100) / (this.pokemonDatos.stats[stat].base_stat + (100 * 1)));
    }
  }

  getWidthLvl = (pokemon: any) => {
    return pokemon.unique.lvl_progress + "%";
  }

  getPokemonsDatosRepeats = () => {

    let arrayPokemonsIgualAlViendo: Array<any> = [];
    this.listadoPokemonsUsuarios.forEach(pokemon => {
      if (pokemon.id_pokemon == this.pokemonDatos.id) {
        let newPokemon = { ...this.pokemonDatos };
        newPokemon.unique = [];
        newPokemon.unique.id = pokemon.id;
        newPokemon.unique.name = pokemon.name_pokemon;
        newPokemon.unique.lvl = pokemon.lvl_pokemon;
        newPokemon.unique.naturaleza = pokemon.naturaleza;
        arrayPokemonsIgualAlViendo.push(newPokemon);
      }
    })
    return arrayPokemonsIgualAlViendo;
  }

  goToPokemonDatos = async (pokemon: any, selected: number, lastSection = 'recharge') => {
    this.pokedexCargada = false;

    if (lastSection !== 'recharge') {
      this.pokemonDatosLastSection = lastSection
    }
    this.deleteStatsChart();
    if (this.activeSection != 'perfil') { this.pokemonDatosBase = { ...pokemon }; }
    this.activeSection = 'perfil';
    this.pokemonDatos = '';
    this.pokemonDatos = { ...pokemon };
    this.pokemonListadoPokemonsRepetidos = this.getPokemonsDatosRepeats();
    this.pokemonDatosSelected = selected;

    this.pokemonDatosMoves = [];
    if (this.pokemonDatosSelected != -1) {
      let pokemonUser = await this.getUserPokemonById(this.pokemonDatos.unique.id);
      this.pokemonDatosMoves.push(await this.getMoves(pokemonUser[0].move_one));
      this.pokemonDatosMoves.push(await this.getMoves(pokemonUser[0].move_two));
      this.pokemonDatosMoves.push(await this.getMoves(pokemonUser[0].move_three));
      this.pokemonDatosMoves.push(await this.getMoves(pokemonUser[0].move_four));
    } else {
      for (let i = 0; i < 4; i++) {
        if (this.pokemonDatos.moves[i] != undefined) {
          this.pokemonDatosMoves.push(await this.getMovesByUrl(this.pokemonDatos.moves[i].move.url));
        } else {
          this.pokemonDatosMoves.push(await this.getMovesByUrl(this.pokemonDatos.moves[0].move.url));
        }
      }
    }

    if (pokemon.unique != undefined) {
      if (pokemon.unique.id != undefined) {
        let pokemonApi = await this.getPokemonById(pokemon.id);
        let pokemonBBDD = await this.getUserPokemonById(pokemon.unique.id);
        let pokemonFusion = await this.getFusionPokemons(pokemonApi, pokemonBBDD[0]);
        this.pokemonDatos = await this.getInBattlePokemon(pokemonFusion);
        this.deleteStatsChart();
        this.getStatsChart();
      }
    }

    this.pokedexCargada = true;
  }

  goToSection = (section: string) => {
    this.activeSection = section;
    if (section == 'equipo') {
      this.getUserBanquillo();
    }
  }

  getEfectividad = (tipoPokemonA: any, tipoPokemonB: any[]) => {
    let efectividadTotal = 1;
    for (const tipoB of tipoPokemonB) {
      efectividadTotal *= tablaEfectividades[tipoPokemonA.type.name][tipoB.type.name];
    }
    if (efectividadTotal == 0) { return 0.5; }
    return efectividadTotal;
  };

  getStabBonus = (tipoPokemon: any, tipoMove: any) => {
    if (typeof tipoPokemon == 'string') {
      if (tipoPokemon == tipoMove.name) {
        return 1.5;
      }
      return 1;
    } else {
      if (tipoPokemon.length > 1) {
        if (tipoPokemon[0].type.name == tipoMove.name) {
          return 1.5;
        } else if (tipoPokemon[1].type.name == tipoMove.name) {
          return 1.5;
        } else {
          return 1;
        }
      } else {
        if (tipoPokemon[0].type.name == tipoMove.name) {
          return 1.5;
        }
        return 1;
      }
    }
  }

  getFusionPokemons = (pokemonApi: any, pokemonBBDD: any) => {
    let newPokemon = pokemonApi
    newPokemon.unique = [];
    newPokemon.unique.id_pokemon = pokemonBBDD.id;
    newPokemon.unique.name = pokemonBBDD.name_pokemon;
    newPokemon.unique.lvl = pokemonBBDD.lvl_pokemon;
    newPokemon.unique.lvl_progress = pokemonBBDD.lvl_progress;
    newPokemon.unique.naturaleza = pokemonBBDD.naturaleza;
    newPokemon.unique.move_one = pokemonBBDD.move_one;
    newPokemon.unique.move_two = pokemonBBDD.move_two;
    newPokemon.unique.move_three = pokemonBBDD.move_three;
    newPokemon.unique.move_four = pokemonBBDD.move_four;
    newPokemon.unique.ivs_ps = pokemonBBDD.ivs_ps_pokemon;
    newPokemon.unique.ivs_atk = pokemonBBDD.ivs_attack_pokemon;
    newPokemon.unique.ivs_def = pokemonBBDD.ivs_defense_pokemon;
    newPokemon.unique.ivs_spa = pokemonBBDD.ivs_sattack_pokemon;
    newPokemon.unique.ivs_spd = pokemonBBDD.ivs_sdefense_pokemon;
    newPokemon.unique.ivs_spe = pokemonBBDD.ivs_speed_pokemon;
    return newPokemon;
  }

  onDragStart = (event: DragEvent, obj: any, index: number, array: any[]) => {
    this.dragObject = obj;
    this.dragIndex = index;
    this.originalArray = array;
  }

  onTouchStart = (event: TouchEvent, obj: any, index: number, array: any[]) => {
    this.dragObject = obj;
    this.dragIndex = index;
    this.originalArray = array;
    this.dragStartPosition = event.touches[0].clientY;
    event.stopPropagation();
  }

  onDragOver = (event: DragEvent) => {
    event.preventDefault();
  }

  onTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop = async (event: DragEvent, targetArray: any[], sourceArray: any[]) => {
    event.preventDefault();
    let arrayPosiciones: Array<any> = [];
    if (this.originalArray !== targetArray && this.dragObject != null) {
      if (this.equipoPokemonsUsuarios.length < 6 && targetArray == this.equipoPokemonsUsuarios) {
        document.getElementById('banca' + this.dragIndex.toString())?.classList.add("pokemonOutBanquillo")

        setTimeout(() => {
          this.originalArray.splice(this.dragIndex, 1);
          targetArray.splice(targetArray.length, 0, this.dragObject);
          for (let index in this.equipoPokemonsUsuarios) {
            let indice: number = parseInt(index + 1);
            arrayPosiciones.push(indice);
          }
          this.guardarEquipoEnBBDD(arrayPosiciones);
        }, 500)

      } else if (targetArray != this.equipoPokemonsUsuarios) {
        this.originalArray.splice(this.dragIndex, 1);
        targetArray.splice(targetArray.length, 0, this.dragObject);
        for (let index in this.equipoPokemonsUsuarios) {
          let indice: number = parseInt(index + 1);
          arrayPosiciones.push(indice);
        }
        this.guardarEquipoEnBBDD(arrayPosiciones);
      }
    } else if (this.originalArray == targetArray && targetArray == this.equipoPokemonsUsuarios) {
      /*console.log("cambiar position")
      console.log(this.dragIndex);
      console.log(event);*/
      if ('srcElement' in event) {
        if ((event as any).srcElement.id) {
          let antiguoPokemon = targetArray[(event as any).srcElement.id];
          targetArray[(event as any).srcElement.id] = targetArray[this.dragIndex];
          targetArray[this.dragIndex] = antiguoPokemon;
          for (let index in this.equipoPokemonsUsuarios) {
            let indice: number = parseInt(index + 1);
            arrayPosiciones.push(indice);
          }
        }
        this.guardarEquipoEnBBDD(arrayPosiciones);
      }
    }

    // reset the drag variables
    setTimeout(() => {
      this.dragObject = null;
      this.dragIndex = -1;
      this.originalArray = [];
    }, 600);
  }

  onTouchEnd = async (event: TouchEvent, targetArray: any[], sourceArray: any[]) => {
    event.preventDefault();
    let arrayPosiciones: Array<any> = [];
    if (this.originalArray !== targetArray && this.dragObject != null) {
      if (this.equipoPokemonsUsuarios.length < 6 && targetArray == this.equipoPokemonsUsuarios) {
        document.getElementById('banca' + this.dragIndex.toString())?.classList.add("pokemonOutBanquillo")

        setTimeout(() => {
          this.originalArray.splice(this.dragIndex, 1);
          targetArray.splice(targetArray.length, 0, this.dragObject);
          for (let index in this.equipoPokemonsUsuarios) {
            let indice: number = parseInt(index + 1);
            arrayPosiciones.push(indice);
          }
          this.guardarEquipoEnBBDD(arrayPosiciones);
        }, 500)

      } else if (targetArray != this.equipoPokemonsUsuarios) {
        this.originalArray.splice(this.dragIndex, 1);
        targetArray.splice(targetArray.length, 0, this.dragObject);
        for (let index in this.equipoPokemonsUsuarios) {
          let indice: number = parseInt(index + 1);
          arrayPosiciones.push(indice);
        }
        this.guardarEquipoEnBBDD(arrayPosiciones);
      }
    } else if (this.originalArray == targetArray && targetArray == this.equipoPokemonsUsuarios) {
      /*console.log("cambiar position")
      console.log(this.dragIndex);
      console.log(event);*/
      if ('srcElement' in event) {
        if ((event as any).srcElement.id) {
          let antiguoPokemon = targetArray[(event as any).srcElement.id];
          targetArray[(event as any).srcElement.id] = targetArray[this.dragIndex];
          targetArray[this.dragIndex] = antiguoPokemon;
          for (let index in this.equipoPokemonsUsuarios) {
            let indice: number = parseInt(index + 1);
            arrayPosiciones.push(indice);
          }
        }
        this.guardarEquipoEnBBDD(arrayPosiciones);
      }
    }

    // reset the drag variables
    setTimeout(() => {
      this.dragObject = null;
      this.dragIndex = -1;
      this.originalArray = [];
    }, 600);
  }


  getMoves = async (idMove: number) => {
    const response = await fetch(`https://pokeapi.co/api/v2/move/${idMove}`);
    const data = await response.json();
    return data;
  }

  getMovesByUrl = async (move: any) => {
    const response = await fetch(move);
    const data = await response.json();
    return data;
  }

  guardarEquipoEnBBDD = async (arrayPosiciones: Array<any>) => {
    const responseDelete = await fetch(this.backendUrl + 'deleteUserTeam.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
    const dataDelete = await responseDelete.json();
    this.equipoPokemonsUsuarios.forEach(async (pokemon, index) => {
      const response = await fetch(this.backendUrl + 'updateUserTeam.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'pokemon': pokemon.unique.id_pokemon, 'position': arrayPosiciones[index] }) });
      const data = await response.json();
    })
  }

  getInBattlePokemon = (pokemon: any) => {
    pokemon.battleStats = [];

    pokemon.battleStats.ps = Math.floor(10 + (parseInt(pokemon.unique.lvl) / 100 * ((parseInt(pokemon.stats[0].base_stat) * 2) + 0 * 4)) + parseInt(pokemon.unique.lvl) + parseInt(pokemon.unique.lvl) * parseInt(pokemon.unique.ivs_ps) / 100);
    pokemon.battleStats.atk = Math.floor(((2 * pokemon.stats[1].base_stat + parseInt(pokemon.unique.ivs_atk) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.def = Math.floor(((2 * pokemon.stats[2].base_stat + parseInt(pokemon.unique.ivs_def) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.spa = Math.floor(((2 * pokemon.stats[3].base_stat + parseInt(pokemon.unique.ivs_spa) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.spd = Math.floor(((2 * pokemon.stats[4].base_stat + parseInt(pokemon.unique.ivs_spd) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.spe = Math.floor(((2 * pokemon.stats[5].base_stat + parseInt(pokemon.unique.ivs_spe) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.actual = [];
    pokemon.battleStats.actual.ps = Math.floor(10 + (parseInt(pokemon.unique.lvl) / 100 * ((parseInt(pokemon.stats[0].base_stat) * 2) + 0 * 4)) + parseInt(pokemon.unique.lvl) + parseInt(pokemon.unique.lvl) * parseInt(pokemon.unique.ivs_ps) / 100);
    pokemon.battleStats.actual.atk = Math.floor(((2 * pokemon.stats[1].base_stat + parseInt(pokemon.unique.ivs_atk) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.actual.def = Math.floor(((2 * pokemon.stats[2].base_stat + parseInt(pokemon.unique.ivs_def) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.actual.spa = Math.floor(((2 * pokemon.stats[3].base_stat + parseInt(pokemon.unique.ivs_spa) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.actual.spd = Math.floor(((2 * pokemon.stats[4].base_stat + parseInt(pokemon.unique.ivs_spd) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    pokemon.battleStats.actual.spe = Math.floor(((2 * pokemon.stats[5].base_stat + parseInt(pokemon.unique.ivs_spe) + (0 / 4)) * pokemon.unique.lvl) / 100 + 5)
    return pokemon;
  }

  getPokemonPSInBattleStatFill = (pokemon: any) => {
    if ((pokemon.battleStats.actual.ps * 100) / pokemon.battleStats.ps <= 0) { return 0; }
    return (pokemon.battleStats.actual.ps * 100) / pokemon.battleStats.ps;
  }

  getPokemonPSInBattleStatDamage = (pokemon: any, damage: number) => {
    if (damage >= pokemon.battleStats.actual.ps) { return (pokemon.battleStats.actual.ps * 100) / pokemon.battleStats.ps; }
    if (damage != 0) {
      return (damage * 100) / pokemon.battleStats.ps;
    }
    return 0;
  }

  getPokemonPSInBattleStatHealth = (pokemon: any, health: number) => {
    if (health > 0) {
      if (health >= pokemon.battleStats.actual.ps) { return (pokemon.battleStats.actual.ps * 100) / pokemon.battleStats.ps; }
      if (health != 0) {
        return (health * 100) / pokemon.battleStats.ps;
      }
    }

    return 0;
  }

  getPokemonPSInBattleStatColor = (pokemon: any) => {
    if ((pokemon.battleStats.actual.ps * 100 / pokemon.battleStats.ps) < 20) { return '#F2583B'; }
    else if ((pokemon.battleStats.actual.ps * 100 / pokemon.battleStats.ps) < 50) { return '#E6CB26'; }
    else { return '#67E999'; }
  }

  setBattleChangePokemon = (pokemonTrainer: any, pokemonPosition: number) => {
    let pokemonBackup;
    this.battle_your_pokemon_animation = 'wait';
    this.battle_enemy_pokemon_animation = 'wait';

    if (pokemonTrainer == 'your') {
      this.battleMessagesLetterByLetter(`¡Sale ${this.formatNamePokemonPokedex(this.battle_your_pokemon.name)}! ¡Entra ${this.formatNamePokemonPokedex(this.battle_yourTeam[pokemonPosition].name)}!`)
      this.battle_your_pokemon_animation = 'changePokemon1';
      this.battle_menu = 'principal';
      setTimeout(async () => {
        pokemonBackup = this.battle_yourTeam[0];
        this.battle_your_pokemon = this.battle_yourTeam[pokemonPosition];
        this.battle_yourTeam[0] = this.battle_yourTeam[pokemonPosition];
        this.battle_yourTeam[pokemonPosition] = pokemonBackup;
        this.battle_your_pokemon_animation = 'changePokemon2';
        this.battle_your_pokemon_moves = [];
        this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_one));
        this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_two));
        this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_three));
        this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_four));

        this.battle_your_pokemon_moves[0].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[0])
        this.battle_your_pokemon_moves[1].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[1])
        this.battle_your_pokemon_moves[2].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[2])
        this.battle_your_pokemon_moves[3].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[3])
      }, 750)
    }
    else {
      this.battleMessagesLetterByLetter(`'El ${this.formatNamePokemonPokedex(this.battle_enemy_pokemon.name)} enemigo sale! ¡Entra ${this.formatNamePokemonPokedex(this.battle_enemyTeam[pokemonPosition].name)}!`)
      this.battle_enemy_pokemon_animation = 'changePokemon1';
      setTimeout(() => {
        pokemonBackup = this.battle_enemyTeam[0];
        this.battle_enemy_pokemon = this.battle_enemyTeam[pokemonPosition];
        this.battle_enemyTeam[0] = this.battle_enemyTeam[pokemonPosition];
        this.battle_enemyTeam[pokemonPosition] = pokemonBackup;
        this.battle_enemy_pokemon_animation = 'changePokemon2';
      }, 750)
    }
  }

  openPokeball = () => {
    this.pokeballOpening = true;
    setTimeout(() => {
      this.pokeballOpening = false;
    }, 5000)
  }

  getOptimizatedPokemonToChat = (pokemon: any) => {
    let pokemonOptimizated = pokemon;
    delete pokemonOptimizated.abilities;
    delete pokemonOptimizated.base_experience;
    delete pokemonOptimizated.forms;
    delete pokemonOptimizated.game_indices;
    delete pokemonOptimizated.height;
    delete pokemonOptimizated.held_items;
    delete pokemonOptimizated.is_default;
    delete pokemonOptimizated.location_area_encounters;
    delete pokemonOptimizated.moves;
    delete pokemonOptimizated.order;
    delete pokemonOptimizated.past_types;
    delete pokemonOptimizated.species;
    delete pokemonOptimizated.sprites;
    delete pokemonOptimizated.weight;
    return pokemonOptimizated;
  }

  generadorDePokemonsAleatorios = async () => {
    let generatedPokemon = await this.getPokemonById(Math.floor(Math.random() * 151) + 1);
    return generatedPokemon;
  }

  getStatsChart = async () => {
    if (!this.pokemonDatosStatsChartGenerated) {
      let arrayStats: Array<any> = [];
      if (this.pokemonDatos.battleStats != undefined) {
        arrayStats.push(this.pokemonDatos.battleStats.actual.ps)
        arrayStats.push(this.pokemonDatos.battleStats.actual.atk)
        arrayStats.push(this.pokemonDatos.battleStats.actual.def)
        arrayStats.push(this.pokemonDatos.battleStats.actual.spe)
        arrayStats.push(this.pokemonDatos.battleStats.actual.spd)
        arrayStats.push(this.pokemonDatos.battleStats.actual.spa)
      } else {
        arrayStats.push(this.pokemonDatos.stats[0].base_stat)
        arrayStats.push(this.pokemonDatos.stats[1].base_stat)
        arrayStats.push(this.pokemonDatos.stats[2].base_stat)
        arrayStats.push(this.pokemonDatos.stats[5].base_stat)
        arrayStats.push(this.pokemonDatos.stats[4].base_stat)
        arrayStats.push(this.pokemonDatos.stats[3].base_stat)
      }
      arrayStats.sort((a, b) => a - b)

      this.pokemonDatosStatsChart = document.getElementById("pokemonDatosStatsChart");
      new Chart(this.pokemonDatosStatsChart.getContext('2d'), {
        type: 'radar',
        data: {
          labels: [
            'PS',
            'Attack',
            'Defense',
            'Speed',
            'Sp.Def',
            'SP.Atk'
          ],
          datasets: [{
            label: '',
            data: arrayStats,
            fill: true,
            backgroundColor: '#6AC7AB',
            borderColor: '#fff',
            pointBackgroundColor: '#6AC7AB',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255,255,255)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 1,
          plugins: {
            legend: {
              display: false,
            }
          },
          scales: {
            r: {
              min: 0,
              max: 120,
              beginAtZero: true,
              angleLines: {
                display: false
              },
              ticks: {
                display: false,
                stepSize: 120
              }
            }
          }
        }
      });
      this.pokemonDatosStatsChartGenerated = true;
    }
  }

  deleteStatsChart = () => {
    this.pokemonDatosStatsChartGenerated = false;
    if (document.getElementById("pokemonDatosStatsChart")) {
      let padreCanvas = document.getElementById("pokemonDatosStatsChartPadre");
      if (padreCanvas?.firstChild) {
        padreCanvas?.removeChild(padreCanvas?.firstChild);
      }
      let canvas = document.createElement("canvas");
      canvas.setAttribute("id", "pokemonDatosStatsChart");
      document.getElementById("pokemonDatosStatsChartPadre")?.appendChild(canvas);
    }
  }

  battleMessagesLetterByLetter = (message?: string) => {
    if (message) {
      this.messageQueue.push(message);
    }
    if (this.messageQueue.length > 0 && !this.battleMessagesLetterByLetterInUse) {
      // Obtener el siguiente mensaje de la cola
      const mensajeActual = this.messageQueue.shift();

      // Establecer el mensaje actual como el mensaje en uso
      this.battle_messages = "";
      if (mensajeActual === undefined) {
        return;
      }

      let mensajeActualChar = mensajeActual.split('');
      this.battleMessagesLetterByLetterInUse = true;

      // Mostrar el mensaje letra por letra
      for (let contadorLetra: number = 0; contadorLetra < mensajeActual.length; contadorLetra++) {
        setTimeout(() => {
          this.battle_messages += mensajeActualChar[contadorLetra];
        }, contadorLetra * 50)
      }

      // Establecer una espera antes de procesar el siguiente mensaje
      setTimeout(() => {
        this.battleMessagesLetterByLetterInUse = false;
        this.battleMessagesLetterByLetter();
      }, (mensajeActual.length + 1) * 50);
    }
    // if (!this.battleMessagesLetterByLetterInUse) {
    //   this.battle_messages = ""
    //   let messageChar = message.split('');
    //   console.log(message.length)
    //   this.battleMessagesLetterByLetterInUse = true;
    //   setTimeout(() => {
    //     console.log("reset")
    //     this.battleMessagesLetterByLetterInUse = false;
    //   }, (message.length + 1) * 50);

    //   for (let contadorLetra: number = 0; contadorLetra < message.length; contadorLetra++) {
    //     setTimeout(() => {
    //       this.battle_messages += messageChar[contadorLetra];
    //     }, contadorLetra * 50)
    //   }
    // }
  }

  showTooltipBattle(tooltip: HTMLDivElement): void {
    if (!this.movil) {
      const button = tooltip.previousSibling?.previousSibling;
      if (button instanceof HTMLElement) {
        const buttonRect = button.getBoundingClientRect();
        if (window.innerHeight > 700) {
          tooltip.style.top = `${buttonRect.top - (100 * window.innerHeight / 100) - (1 * window.innerHeight / 100)}px`;
        } else {
          tooltip.style.top = `${buttonRect.top - (100 * window.innerHeight / 100) - (2.4 * window.innerHeight / 100)}px`;
        }
        tooltip.style.left = `${buttonRect.left - (3 * window.innerHeight / 100) - (0.2 * window.innerHeight / 100)}px`;
        tooltip.style.display = 'flex';
      }
    }
  }

  hideTooltipBattle(tooltip: HTMLDivElement): void {
    tooltip.style.display = 'none';
  }

  battleCalculationAilment = (pokemon: any) => {
    if (pokemon.battleStats.states.length > 0) {
      pokemon.battleStats.states.forEach((state: any) => {
        switch (state.name) {
          // PROGRAMADAS
          // FREEZE, PARALISIS, SLEEP, BURN, POISON, INFAUTATION
          case 'paralysis': break;
          //case 'sleep': pokemon.battleStats.sleepturns -=1; break;
          //case 'freeze': if(Math.random() * 100 < 20){ pokemon.battleStats.states.splice(pokemon.battleStats.states.indexOf("freeze"),1) } break;
          case 'burn': pokemon.battleStats.actual.ps -= Math.floor(pokemon.battleStats.ps / 16) > 0 ? Math.floor(pokemon.battleStats.ps / 16) : 1; break;
          case 'poison': pokemon.battleStats.actual.ps -= Math.floor(pokemon.battleStats.ps / 16) > 0 ? Math.floor(pokemon.battleStats.ps / 16) : 1; break;
          case 'confusion': break;
          case 'infatuation': break; // NO HACE NADA, NO HAY SEXOS
          case 'trap': break; // FALTA EN EL FRONT, AQUI CREO QUE NO HACE NADA, ALGUN CHEQUEO DE BAJAR TURNO SI ESO
          case 'nightmare': break; //CHEQUEAR LO QUE HACE, PONIA 1/2 de su vida TOTAL cada turno, roto
          case 'torment': break;
          case 'disable': break;
          case 'yawn': break;
          case 'heal-block': break;
          case 'no-type-inmunity': break;
          case 'leech-seed': break;
          case 'embargo': break;
          case 'perish-song': break;
          case 'ingrain': break;
          default: break;
        }
      })
    }
  }

  battleCalculationPriority = () => {
    // PRIORIDAD SI CAMBIA DE POKEMON
    if (this.battle_your_pokemon_move == 'pokemon') { this.battle_priority = 'your'; }
    else if (this.battle_enemy_pokemon_move == 'pokemon') { this.battle_priority = 'enemy'; }
    // OBJETOS IRIAN AQUI
    // PRIORIDAD DE ATAQUE
    else if (this.battle_your_pokemon_movement.priority > this.battle_enemy_pokemon_movement.priority) { this.battle_priority = 'your'; }
    else if (this.battle_your_pokemon_movement.priority < this.battle_enemy_pokemon_movement.priority) { this.battle_priority = 'enemy'; }
    // PRIORIDAD DE STATS
    else if (this.battle_your_pokemon.battleStats.actual.spe >= this.battle_enemy_pokemon.battleStats.actual.spe) { this.battle_priority = 'your'; }
    else { this.battle_priority = 'enemy'; }
  }

  battleNextTurn = () => {
    this.battle_turn++;
    this.battle_turn_choose = true;
    if (!this.battleEndTurn) {
      setTimeout(() => {
        this.battleMessagesLetterByLetter(`¿Que deberia hacer ${this.formatNamePokemonPokedex(this.battle_your_pokemon.name)}?`)
      }, 1500)
    }
  }

  battleCalculationMove = async (pokemonAtaca: any, pokemonRecibe: any, movementRealizado: any) => {
    // RESET DE FINAL DE TURNO
    this.battle_your_pokemon_animation = 'wait';
    this.battle_enemy_pokemon_animation = 'wait';
    this.battle_movement_healing = 0
    this.battle_movement_drain = [];
    this.battle_damageDrain_width = 0;
    this.battle_damage_width = 0;
    this.battle_health_width = 0;

    // check repeticiones
    let battle_movement_hits = 1;
    if (movementRealizado.meta.min_hits != null) {
      battle_movement_hits = Math.floor(Math.random() * (movementRealizado.meta.max_hits - movementRealizado.meta.min_hits + 1)) + movementRealizado.meta.min_hits;
    }

    // check meta > ailment chance
    let battle_movement_ailment_chance = Math.random() * 100 < movementRealizado.meta.ailment_chance;
    //let battle_movement_ailment_chance = true;

    // check meta > ailment
    let battle_movement_ailment = movementRealizado.meta.ailment;

    // check crit rate, 0 = 0, 1 = 6.25, 2 = 12.5, 3 = 50%
    let battle_movement_critic = [];
    for (let i = 0; i < battle_movement_hits; i++) {
      if (movementRealizado.meta.crit_rate == 1) { battle_movement_critic.push(Math.random() * 100 < 12.5); }
      else if (movementRealizado.meta.crit_rate == 2) { battle_movement_critic.push(Math.random() * 100 < 18.25); }
      else if (movementRealizado.meta.crit_rate == 3) { battle_movement_critic.push(Math.random() * 100 < 56.25); }
    }
    if (battle_movement_critic.length <= 0) { battle_movement_critic.push(false); }

    // damage calculation
    this.battle_damage = [];
    for (let i = 0; i < battle_movement_hits; i++) {
      // random modifier 
      let battle_randomModifier = Math.random() * 0.15 + 0.85;
      let damage = (((((2 * pokemonAtaca.unique.lvl / 5 + 2) * pokemonAtaca.battleStats.atk * movementRealizado.power / pokemonRecibe.battleStats.def) / 50) + 2) * this.battle_your_pokemon_modification) * this.getStabBonus(pokemonAtaca.types, movementRealizado.type) * this.getEfectividad(movementRealizado, pokemonRecibe.types) * battle_randomModifier;
      if (battle_movement_critic[i]) { damage = 1.5 * damage; }
      if (damage < 1) { damage = 1 }
      if (movementRealizado.power == null) { damage = 0; }
      this.battle_damage.push(Math.floor(damage));
    }

    // check healing 0=no cura, 1=cura toda la vida, intermedios cura porcentajes (RESPECTO VIDA TOTAL DEL QUE LO USA)
    if (movementRealizado.meta.healing != 0) {
      this.battle_movement_healing = (movementRealizado.meta.healing * pokemonAtaca.battleStats.ps) / 100;
    }

    // check drain, igual que arriba (RESPECTO DAÑO INFLINGIDO, ESTO INFLINGUE DAÑO Y CURA)
    if (movementRealizado.meta.drain != 0) {
      for (let i = 0; i < battle_movement_hits; i++) {
        let drain = Math.floor(this.battle_damage[i] * movementRealizado.meta.drain / 100);
        if (drain < 1 && drain > 0) { drain = 1; }
        if (drain > -1 && drain < 0) { drain = -1; }
        this.battle_movement_drain.push(drain);
      }
    }
    // check flinch, 0=nunca, 1 siempre, entre medios porcentaje (hace que si sale true el enemigo pierda el turno)
    let battle_movement_flinch = Math.random() * 100 < movementRealizado.meta.flinch_chance;

    // check cambio de stats
    let battle_movement_stat_name: Array<any> = []
    let battle_movement_stat_change: Array<any> = [];
    movementRealizado.stat_changes.forEach((stat: any) => {
      battle_movement_stat_name.push(stat.stat.name);
      battle_movement_stat_name.push(stat.change);
    })

    //iniciamos states si no existen
    if (!pokemonAtaca.battleStats.states) { pokemonAtaca.battleStats.states = []; }
    if (!pokemonRecibe.battleStats.states) { pokemonRecibe.battleStats.states = []; }

    // check ailment paralysis
    let battle_movement_paralisis = false;
    //if(pokemonAtaca.battleStats.states.includes("paralysis")){
    //  battle_movement_paralisis = Math.random() * 100 < 25;
    //} 

    // check ailment freeze
    let battle_movement_freeze = false;
    //if(pokemonAtaca.battleStats.states.includes("freeze")){
    //  battle_movement_freeze = true;
    //} 

    // Apply everything
    if (this.battle_turn_player == 'your') {
      this.battleMessagesLetterByLetter(`¡Tu ${this.formatNamePokemonPokedex(pokemonAtaca.name)} ha usado ${movementRealizado.names[5].name}!`)
    } else {
      this.battleMessagesLetterByLetter(`¡El ${this.formatNamePokemonPokedex(pokemonAtaca.name)} enemigo ha usado ${movementRealizado.names[5].name}!`)
    }

    if (battle_movement_hits == null) { battle_movement_hits = 1; }
    for (let i = 0; i < battle_movement_hits; i++) {
      // check accuracy
      let battle_movement_accuracy = Math.random() * 100 < movementRealizado.accuracy;
      if (movementRealizado.accuracy == null) { battle_movement_accuracy = true }

      if (battle_movement_accuracy && !battle_movement_paralisis && !battle_movement_freeze) {

        // APLICAMOS ESTADO
        if (battle_movement_ailment_chance) {
          pokemonRecibe.battleStats.states.push(battle_movement_ailment);
          if (battle_movement_ailment.name == 'sleep') {
            pokemonRecibe.battleStats.sleepturns = Math.floor(Math.random() * 7) + 1;
          }
        }

        // APLICAMOS ESTADOS RAROS
        if (battle_movement_ailment == 'leech-seed') { pokemonRecibe.battleStats.states.push(battle_movement_ailment); }

        // APLICAMOS FLINCH
        if (battle_movement_flinch) { pokemonRecibe.battleStats.flinch = true; }

        if (battle_movement_stat_name.length > 0) {
          battle_movement_stat_name.forEach((name, index) => {
            switch (name) {
              case 'hp': pokemonRecibe.battleStats.actual.ps += battle_movement_stat_change[index] * 10; break;
              case 'attack': pokemonRecibe.battleStats.actual.atk += battle_movement_stat_change[index] * 1000; break;
              case 'defense': pokemonRecibe.battleStats.actual.def += battle_movement_stat_change[index] * 10; break;
              case 'special-attack': pokemonRecibe.battleStats.actual.spa += battle_movement_stat_change[index] * 10; break;
              case 'special-defense': pokemonRecibe.battleStats.actual.spd += battle_movement_stat_change[index] * 10; break;
              case 'speed': pokemonRecibe.battleStats.actual.spe += battle_movement_stat_change[index] * 10; break;
            }
          })
        }

        /* ANIMACIONES, BARRAS DE VIDA */
        if (this.battle_turn_player == 'your') {
          this.battle_your_pokemon_animation = 'attack';
          this.battle_enemy_pokemon_animation = 'receiveAttack';
        } else {
          this.battle_your_pokemon_animation = 'receiveAttack';
          this.battle_enemy_pokemon_animation = 'attack';
        }

        setTimeout(() => {
          this.battle_your_pokemon_animation = 'wait';
          this.battle_enemy_pokemon_animation = 'wait';
        }, 3000 * i)

        setTimeout(async () => {
          if (this.battle_turn_player == 'your') {
            this.battle_your_pokemon_animation = 'attack';
            this.battle_enemy_pokemon_animation = 'receiveAttack';
          } else {
            this.battle_your_pokemon_animation = 'receiveAttack';
            this.battle_enemy_pokemon_animation = 'attack';
          }
          // METEMOS DAÑO AL ENEMIGO
          this.battle_damage_width = await this.getPokemonPSInBattleStatDamage(pokemonRecibe, this.battle_damage[i]);
          if (this.battle_damage[i] >= pokemonRecibe.battleStats.actual.ps) { pokemonRecibe.battleStats.actual.ps = 0; }
          else { pokemonRecibe.battleStats.actual.ps -= this.battle_damage[i]; }

          // METEMOS DRAIN EN CASO QUE HAYA
          if (this.battle_movement_drain[i]) {
            if (pokemonAtaca.battleStats.actual.ps + this.battle_movement_drain[i] < pokemonAtaca.battleStats.ps) {
              pokemonAtaca.battleStats.actual.ps += this.battle_movement_drain[i];
            } else {
              pokemonAtaca.battleStats.actual.ps = pokemonAtaca.battleStats.ps;
            }
            if (this.battle_movement_drain[i] > 0) {
              this.battle_damageDrain_width = 0;
              this.battle_health_width = await this.getPokemonPSInBattleStatHealth(pokemonRecibe, this.battle_movement_drain[i]);
            } else if (this.battle_movement_drain[i] < 0) {
              this.battle_damageDrain_width = await this.getPokemonPSInBattleStatDamage(pokemonRecibe, -(this.battle_movement_drain[i]));
            }
          }

          // METEMOS HEALTH EN CASO QUE HAYA
          if (this.battle_movement_healing > 0) {
            if (pokemonAtaca.battleStats.actual.ps + this.battle_movement_healing < pokemonAtaca.battleStats.ps) { pokemonAtaca.battleStats.actual.ps += this.battle_movement_healing }
            else { pokemonAtaca.battleStats.actual.ps = pokemonAtaca.battleStats.ps; }
            if (this.battle_movement_healing > 0) {
              this.battle_health_width = await this.getPokemonPSInBattleStatHealth(pokemonRecibe, this.battle_movement_healing);
            }
          } else {
            this.battle_health_width = 0;
          }
        }, 3100 * i)
      } else {
        if (!battle_movement_accuracy) {
          if (this.battle_turn_player == 'your') {
            this.battle_your_pokemon_animation = 'attack';
            this.battle_enemy_pokemon_animation = 'esquiveAttack';
          } else {
            this.battle_your_pokemon_animation = 'esquiveAttack';
            this.battle_enemy_pokemon_animation = 'attack';
          }
        }
        if (this.battle_turn_player == 'your') {
          this.battleMessagesLetterByLetter(`¡Tu ${this.formatNamePokemonPokedex(pokemonAtaca.name)} ha fallado!`);
          break;
        } else {
          this.battleMessagesLetterByLetter(`¡El ${this.formatNamePokemonPokedex(pokemonAtaca.name)} enemigo ha fallado!`)
          break;
        }
      }
    }

    // CONSOLES
    // console.log('Accuracy: ' + battle_movement_accuracy);
    // console.log('Ailment: ' + battle_movement_ailment.name);
    // console.log('AilmentChance: ' + battle_movement_ailment_chance);
    // console.log('Critic: ' + battle_movement_critic);
    // console.log('Drain: ' + battle_movement_drain);
    // console.log('Healing: ' + battle_movement_healing);
    // console.log('Flinch: ' + battle_movement_flinch);
    // console.log('Hits: ' + battle_movement_hits);
    // console.log('Daño: ' + this.battle_damage);
    // console.log('---------------------')
    return battle_movement_hits;
  }


  getAilmentByName = (ailment: string) => {
    switch (ailment) {
      case 'unknown': break;
    }
  }

  getDescriptionInSpanishMove = (move: any) => {
    for (let descripcion of move.flavor_text_entries) {
      if (descripcion.language.name == 'es') {
        return descripcion.flavor_text;
      }
    }
    return '';
  }

  getPrompt = (selectedPrompt: any) => {
    if (selectedPrompt == 'first_prompt') {
      return "Please perform the function of a Pokemon Trainer following the rules listed below: Presentation Rules: 1. I will give you some context about the battle that is taking place. 2. The game output will always show a number of your choice of the election of your choice. 3. You will never write anything but a number. 4. The number will only be one digit. 5. You only choose one action from the ones I list Fundamental Game Mechanics: 1. Pokemon rules in combat. Refer back to these rules after every prompt. Start Battle, in the next message I will pass you the context of the battle. Wait the context of the battle like your pokemon, enemy pokemon and more. Wait more information."
    }
    else if (selectedPrompt == 'pass_context') {
      let tiposEnemy = '';
      let tiposPlayer = '';
      if (this.battle_enemy_pokemon.types.length > 1) {
        tiposEnemy += this.battle_enemy_pokemon.types[0].type.name + " and " + this.battle_enemy_pokemon.types[1].type.name
      } else { tiposEnemy = this.battle_enemy_pokemon.types[0].type.name }
      if (this.battle_your_pokemon.types.length > 1) {
        tiposPlayer += this.battle_your_pokemon.types[0].type.name + " and " + this.battle_your_pokemon.types[1].type.name
      } else { tiposPlayer = this.battle_your_pokemon.types[0].type.name }

      return `Your pokemon: ${this.battle_enemy_pokemon.name}, there is the information of pokemon stats: - Types: ${tiposEnemy} - LVL: ${this.battle_enemy_pokemon.unique.lvl} - PS: ${this.battle_enemy_pokemon.battleStats.actual.ps} - Attack: ${this.battle_enemy_pokemon.battleStats.actual.atk} - Defense: ${this.battle_enemy_pokemon.battleStats.actual.def} - Special attack: ${this.battle_enemy_pokemon.battleStats.actual.spa} - Special defense: ${this.battle_enemy_pokemon.battleStats.actual.spd} - Speed: ${this.battle_enemy_pokemon.battleStats.actual.spe} - Aditional information about stats: https://pokeapi.co/api/v2/pokemon/${this.battle_enemy_pokemon.id} Enemy pokemon: ${this.battle_your_pokemon.name}, there is the information of pokemon stats: - Types: ${tiposPlayer} - LVL: ${this.battle_your_pokemon.unique.lvl} - PS: ${this.battle_your_pokemon.battleStats.actual.ps} - Aditional information about stats: https://pokeapi.co/api/v2/pokemon/${this.battle_your_pokemon.id} We dont have information abouts his stats. Is the turn of your oponent, you need to wait your turn, you will receive more information about the events of the combat in the next prompt.`
    }
    else if (selectedPrompt == "player-attack-context") {
      return `Enemy ${this.battle_your_pokemon.name} use ${this.battle_lastMovement.name} and infliged to your ${this.battle_enemy_pokemon.name} ${Math.floor(this.battle_damage[0])} points of PS, there is more information about his movement: https://pokeapi.co/api/v2/move/${this.battle_lastMovement.id} Your ${this.battle_enemy_pokemon.name} new stats are: - PS: ${this.battle_enemy_pokemon.battleStats.actual.ps} Is your turn, you need to choose one of the options below: 1. Use ${this.battle_enemy_pokemon_moves[0].name} - https://pokeapi.co/api/v2/move/${this.battle_enemy_pokemon_moves[0].id} 2. Use ${this.battle_enemy_pokemon_moves[1].name} - https://pokeapi.co/api/v2/move/${this.battle_enemy_pokemon_moves[1].id} 3. Use ${this.battle_enemy_pokemon_moves[2].name} - https://pokeapi.co/api/v2/move/${this.battle_enemy_pokemon_moves[2].id} 4. Use ${this.battle_enemy_pokemon_moves[3].name} - https://pokeapi.co/api/v2/move/${this.battle_enemy_pokemon_moves[3].id} Please, only return the number of the option selected, no information, no explications, only the number of the option.`;
    }
    return "Please perform the function of a Pokemon Trainer following the rules listed below: Presentation Rules: 1. I will give you some context about the battle that is taking place. 2. The game output will always show a number of your choice of the election of your choice. 3. You will never write anything but a number. 4. The number will only be one digit. 5. You only choose one action from the ones I list Fundamental Game Mechanics: 1. Pokemon rules in combat. Refer back to these rules after every prompt. Start Battle, in the next message I will pass you the context of the battle. Wait the context of the battle like your pokemon, enemy pokemon and more. Wait more information."
  }

  cerrarPestanyaTeam = () => {
    this.teamPestanya = (this.teamPestanya == 'abierta') ? 'cerrada' : 'abierta';
  }

  getPokemonImgVH = (height: number) => {
    if (height > 18) { height = 18; }
    let size = (20 - (0.8 * (13 - height)));
    return (Math.round(size * 100) / 100);
  }

  openPack = async (pack: number) => {
    if (this.userLoged.packsfree > 0) {
      const responseMoney = await fetch(this.backendUrl + 'newFreePacks.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
      const dataMoney = await responseMoney.json();
    } else if (this.userLoged.money >= 500) {
      const responseMoney = await fetch(this.backendUrl + 'newMoney.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'money': 500 }) });
      const dataMoney = await responseMoney.json();
    } else {
      return;
    }

    let numeroAleatorio = Math.floor(Math.random() * this.pokemonList.length);
    document.getElementsByClassName("shopOpeningBlackWindow")[0].classList.remove("d-none");
    this.shopPokemon = this.pokemonList[numeroAleatorio];
    this.shopOpening = true;
    let arrayMoves: Array<number> = [];
    if (this.shopPokemon.moves.length > 4) {
      if (this.shopPokemon.moves.length > 10) {
        while (arrayMoves.length < 4) {
          let random = Math.floor(Math.random() * this.shopPokemon.moves.length + 1);
          const responseMove = await fetch(this.shopPokemon.moves[random].move.url);
          const dataMove = await responseMove.json();
          !arrayMoves.includes(dataMove.id) ? arrayMoves.push(dataMove.id) : null;
        }
      } else {
        while (arrayMoves.length < 4) {
          let random = Math.floor(Math.random() * this.shopPokemon.moves.length);
          const responseMove = await fetch(this.shopPokemon.moves[random].move.url);
          const dataMove = await responseMove.json();
          !arrayMoves.includes(dataMove.id) ? arrayMoves.push(dataMove.id) : null;
        }
      }
    } else if (this.shopPokemon.moves.length == 4) {
      for (let i = 0; i < 4; i++) {
        const responseMove = await fetch(this.shopPokemon.moves[i].move.url);
        const dataMove = await responseMove.json();
        arrayMoves.push(dataMove.id);
      }
    } else {
      const responseMove = await fetch(this.shopPokemon.moves[0].move.url);
      const dataMove = await responseMove.json();
      arrayMoves.push(dataMove.id);
      arrayMoves.push(dataMove.id);
      arrayMoves.push(dataMove.id);
      arrayMoves.push(dataMove.id);
    }

    let min = 1;
    let max = 5;
    let lvl = Math.floor(Math.random() * (max - min + 1)) + min;
    const newPokemon = await fetch(this.backendUrl + 'addPokemonToUser.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'lvl': lvl, 'pokemonId': this.shopPokemon.id, 'move1': arrayMoves[0], 'move2': arrayMoves[1], 'move3': arrayMoves[2], 'move4': arrayMoves[3] }) });
    const datanewPokemon = await newPokemon.json();

    const response = await fetch(this.backendUrl + 'getUser.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
    const data = await response.json();
    localStorage.setItem("login", JSON.stringify(data[0]))
    let loginData = localStorage.getItem("login");
    if (loginData !== null) {
      this.userLoged = JSON.parse(loginData);
    } else {
      this.userLoged = '';
    }
  }

  closePack = () => {
    this.shopOpening = false;
    document.getElementsByClassName("shopOpeningBlackWindow")[0].classList.add("d-none");
  }

  getState = (pokemon: any, state: string) => {
    if (pokemon.battleStats.states) {
      for (let i = 0; i < pokemon.battleStats.states.length; i++) {
        if (pokemon.battleStats.states[i].name == state) {
          return true;
        }
      }
    }
    return false;
  }

  battleDie = async () => {
    this.battle_menu_show = false;
    if (this.battle_enemy_pokemon.battleStats.actual.ps <= 0) {
      if (this.battle_enemyTeam.length > 1) {
        this.battle_enemy_pokemon_animation = 'die';
        this.battle_your_pokemon_animation = 'idle';
        setTimeout(async () => {
          this.battle_menu_show = false;
          this.battle_enemyTeam.splice(0, 1);
          this.battle_enemy_pokemon = this.battle_enemyTeam[0];
          this.battle_enemy_pokemon_animation = 'enter';
          this.battle_your_pokemon_animation = 'idle';
          this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_one));
          this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_two));
          this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_three));
          this.battle_enemy_pokemon_moves.push(await this.getMoves(this.battle_enemy_pokemon.unique.move_four));
        }, 800);

        setTimeout(() => {
          this.battle_menu_show = true;
          this.battle_menu = 'principal';
        }, 1600);
      } else {
        this.battleResult = 'victory';

        this.pokedexCargada = false;
        const responseMoney = await fetch(this.backendUrl + 'newMoney.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'money': -500 }) });
        const dataMoney = await responseMoney.json();
        const response = await fetch(this.backendUrl + 'getUser.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
        const data = await response.json();
        localStorage.setItem("login", JSON.stringify(data[0]))
        let loginData = localStorage.getItem("login");
        if (loginData !== null) {
          this.userLoged = JSON.parse(loginData);
        } else {
          this.userLoged = '';
        }

        for (let i = 0; i < this.battle_yourTeam.length; i++) {
          let minLvl = 30;
          let maxLvl = 50;
          let plusProgress = Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl;
          let newProgress = Number(this.battle_yourTeam[i].unique.lvl_progress) + Number(plusProgress)
          let lvl = this.battle_yourTeam[i].unique.lvl;
          if (newProgress >= 100) {
            newProgress -= 100;
            lvl++;
          }
          const responseLvl = await fetch(this.backendUrl + 'newLvl.php', { method: 'POST', body: JSON.stringify({ 'idPokemon': Number(this.battle_yourTeam[i].unique.id_pokemon), 'lvl': lvl, 'progress': newProgress }) });
          const dataLvl = await responseLvl.json();
        }

        this.equipoPokemonsUsuarios = [];
        this.getUserTeam();
        this.pokedexCargada = true;
        this.setSection("final");
      }
    } else if (this.battle_your_pokemon.battleStats.actual.ps <= 0) {
      if (this.battle_yourTeam.length > 1) {
        this.battle_your_pokemon_animation = 'die';
        this.battle_enemy_pokemon_animation = 'idle';
        setTimeout(async () => {
          this.battle_menu_show = false;
          this.battle_yourTeam.splice(0, 1);
          this.battle_your_pokemon = this.battle_yourTeam[0];
          this.battle_your_pokemon_moves = [];
          this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_one));
          this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_two));
          this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_three));
          this.battle_your_pokemon_moves.push(await this.getMoves(this.battle_your_pokemon.unique.move_four));

          this.battle_your_pokemon_moves[0].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[0])
          this.battle_your_pokemon_moves[1].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[1])
          this.battle_your_pokemon_moves[2].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[2])
          this.battle_your_pokemon_moves[3].descripcionSpanish = this.getDescriptionInSpanishMove(this.battle_your_pokemon_moves[3])
          this.battle_your_pokemon_animation = 'changePokemon2';
          this.battle_enemy_pokemon_animation = 'idle';
          this.battleMessagesLetterByLetter(`¿Que deberia hacer ${this.formatNamePokemonPokedex(this.battle_your_pokemon.name)}?`)
        }, 800);

        setTimeout(() => {
          this.battle_menu_show = true;
          this.battle_menu = 'principal';
        }, 1600);
      } else {
        this.battleResult = 'defeat';

        this.pokedexCargada = false;
        const responseMoney = await fetch(this.backendUrl + 'newMoney.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'money': -200 }) });
        const dataMoney = await responseMoney.json();
        const response = await fetch(this.backendUrl + 'getUser.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
        const data = await response.json();
        localStorage.setItem("login", JSON.stringify(data[0]))
        let loginData = localStorage.getItem("login");
        if (loginData !== null) {
          this.userLoged = JSON.parse(loginData);
        } else {
          this.userLoged = '';
        }

        for (let i = 0; i < this.battle_yourTeam.length; i++) {
          let minLvl = 10;
          let maxLvl = 25;
          let plusProgress = Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl;
          let newProgress = Number(this.battle_yourTeam[i].unique.lvl_progress) + Number(plusProgress)
          let lvl = this.battle_yourTeam[i].unique.lvl;
          if (newProgress >= 100) {
            newProgress -= 100;
            lvl++;
          }
          const responseLvl = await fetch(this.backendUrl + 'newLvl.php', { method: 'POST', body: JSON.stringify({ 'idPokemon': Number(this.battle_yourTeam[i].unique.id_pokemon), 'lvl': lvl, 'progress': newProgress }) });
          const dataLvl = await responseLvl.json();
        }

        this.equipoPokemonsUsuarios = [];
        this.getUserTeam();
        this.pokedexCargada = true;
        this.setSection("final");
      }
    }
  }

  deletePokemon = async () => {
    this.pokedexCargada = false;
    this.pokemonDatosSelected = -1;
    this.goToPokemonDatos(this.pokemonDatos, -1);
    this.pokedexCargada = false;

    const responseDelete = await fetch(this.backendUrl + 'deleteUserPokemon.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'idPokemon': this.pokemonDatos.unique.id_pokemon }) });
    const dataDelete = await responseDelete.json();
    const responseMoney = await fetch(this.backendUrl + 'newMoney.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname, 'money': -200 }) });
    const dataMoney = await responseMoney.json();
    const response = await fetch(this.backendUrl + 'getUser.php', { method: 'POST', body: JSON.stringify({ 'nickname': this.userLoged.nickname }) });
    const data = await response.json();
    localStorage.setItem("login", JSON.stringify(data[0]))
    let loginData = localStorage.getItem("login");
    if (loginData !== null) {
      this.userLoged = JSON.parse(loginData);
    } else {
      this.userLoged = '';
    }
    this.listadoPokemonsUsuarios = [];
    this.equipoPokemonsUsuarios = [];
    this.pokemonBanquillo = [];
    await this.setUserPokemons();
    this.goToPokemonDatos(this.pokemonDatos, -1);
    this.pokedexCargada = true;

  }
}

