import React, { useEffect, useState } from 'react'
import { cuadros } from './assets/datos'
import './App.css'

function App() {

  /* CuadrosJuntos: es una copia del array "datos" pero repetido dos veces,
  * para poder tener dos parejas de cada imagen.
  */
  const cuadrosJuntos = [...cuadros, ...cuadros]

  /* CuadrosPrevios: este segundo array copiamos el array doble "cuadrosJuntos" para convertirlo
   * en un array de objetos usando map(parámetro) para obtener cada imagen 
   * y añadir el estado visible (estado:1) o no visible (estado:0 -> por defecto) de cada imagen.
   */
  const cuadrosPrevios = cuadrosJuntos.map(valor => ({
    imagen: valor,
    estado: 0
  }))

  /* con "setMisCuadros" desordenaremos el array "cuadrosPrevios" usando el algoritmo de Fischer-Yates
   * y almacenamos cada imagen desordenada en el nuevo array "misCuadros".
  */
  const [misCuadros, setMisCuadros] = useState([])
  const [misTiradas, setMisTiradas] = useState([])
  const [aciertos, setAciertos] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [mensaje, setMensaje] = useState()
  const [finalizado, setFinalizado] = useState(false)

  useEffect(() => {

    /* Recorremos el array "cuadrosPrevios" desde el último valor. */
    for (let i = cuadrosPrevios.length - 1; i > 0; i--) {

      /* Azar: método para aleatorizar el desordenamiento de imágenes contenidas en "cuadrosPrevios". */
      const azar = Math.floor(Math.random() * (i + 1));

      /* Método de intercambio de imágenes. Ejemplo: el algoritmo intercambia el 5 por el 3 y el 3 por el 5.*/
      [cuadrosPrevios[i], cuadrosPrevios[azar]] = [cuadrosPrevios[azar], cuadrosPrevios[i]]
    }
    // Almacenamos los valores recién desordenados en "cuadrosPrevios" en la variable "misCuadros".
    setMisCuadros([...cuadrosPrevios])
  }, [])

  /* tapado: variable con CSS en línea del cuadro con el rey oculto. */
  const tapado = {
    backgroundImage: `url(https://www.html6.es/img/rey_.png)`
  }

  const marcar = (e) => {
    /* La variable existe filtra por el índice cuáles han sido las imágenes de los reyes pulsados. */
    const existe = misTiradas.find((objeto) => objeto.indice === e)
    const yaEncontrada = misCuadros[e].estado

    /* Condicionales:
    1.  Debemos agregar una restricción para limitar a 2 la cantidad de reyes seleccionados por tirada. Para ello,
        si el array "misTiradas" es menor de 2, permitirá pulsar en otro rey; si no, no se podrá seleccionar otro 
        si antes no se han ocultado los 2 anteriores previamente pulsados.
    2. "!existe": el segundo rey pulsado no es el mismo que el primero.
    3. "yaEncontrada": restricción para que no se pueda pulsar uno de los reyes en pareja descubiertos (visibles).
    */
    if (misTiradas.length < 2 && !existe && yaEncontrada === 0) {

      /* Con la función "setMisTiradas" obtenemos (hacemos copia con el operador de propagación [...])
      * todo el valor actual del array "misTiradas" (con valor inicial [0])
      * y le añadimos el objeto con la imagen y el índice de los reyes que han sido pulsados (argumento e).
      */
      setMisTiradas([...misTiradas,
      {
        imagen: misCuadros[e].imagen,
        indice: e
      }
      ])

      /* const prevItem: creamos un array que es copia exacta del array "misCuadros". */
      const prevItem = [...misCuadros]

      /* Accedemos al cuadro que ha sido pulsado y le cambiamos el estado a 1 (visible). */
      prevItem[e].estado = 1

      /* Modificamos el array misCuadros con el nuevo valor del estado. */
      setMisCuadros(prevItem)
    }
  }
  useEffect(() => {

    /* El array "misTiradas" será igual a 2 si hemos pulsado en 2 reyes. */
    if (misTiradas.length === 2) {

      /* Contabilizamos un intento del jugador, sea acertado o no. */
      setIntentos(intentos + 1)

      /* Comprobamos si las imágenes del primer y el segundo rey pulsado son iguales o no. */
      if (misTiradas[0].imagen === misTiradas[1].imagen) {
        /* Si lo son, reiniciamos las tiradas e incrementamos un acierto al marcador. */
        setMisTiradas([])
        setAciertos(aciertos + 1)
        if (aciertos + 1 >= cuadros.length) {
          setMensaje("Has acabado el juego!")
          setFinalizado(true)
        }
      } else {
        /* Si no lo son, añadimos un tiempo de 2 segundos para que el jugador veas las cartas erróneas pulsadas. */
        setTimeout(() => {
          /* Recorremos el array "misTiradas" con los 2 reyes pulsados. */
          misTiradas.map(objeto => {
            /* Hacemos una copia provisional del array original "misCuadros"; 
            * en el array "provisional" cambiamos el valor "estado" para volverlo a poner a 0 (no visible);
            * devolvemos el array actualizado a "misCuadros" y reiniciamos las tiradas.
            */
            const provisional = [...misCuadros]
            provisional[objeto.indice].estado = 0;
            setMisCuadros(provisional);
            setMisTiradas([])
          })
        }, 1000)
      }
    }
  }, [misTiradas])

  /* Reiniciamos el juego volviendo a los valores iniciales. */
  const reiniciar = () => {
    setMisCuadros([...cuadrosPrevios])
    setAciertos(0)
    setIntentos(0)
    setMisTiradas([])
    setFinalizado(false)
  }

  return (
    <>
      {finalizado &&
        <div className='panel'>
          <div className='texto'>
            <div className='mensaje'>
              {mensaje}
            </div>
            <button onClick={() => reiniciar()}>Jugar otra vez</button>
          </div>
        </div>
      }
      <div className='letrero'>
        <h1 className='titulo'>Juego de avidinar parejas</h1>
        <span className='descripcion'>Averigua dónde se esconde cada pareja de reyes.</span>
      </div>
      <div className='tablero'>
        <div className='cuadros'>
          {misCuadros.map((dato, index) =>
            (dato.estado === 0)
              ? (<div onClick={() => marcar(index)} className='cuadro' key={index} style={tapado}>
                <div className='atras'><img src='https://www.html6.es/img/naranja.png' alt='fondo' />
                </div>
              </div>)

              : (<div onClick={() => marcar(index)} className='cuadro' key={index}
                style={{ backgroundImage: `url(${misCuadros[index].imagen})` }}>
                <div className='atras'><img src='https://www.html6.es/img/naranja.png' alt='fondo' />
                </div>
              </div>)
          )}
        </div>
      </div>
      <div className='aciertos'>
        {aciertos} aciertos de {intentos} intentos
        {(intentos > 0) && <span className='intentos'>&nbsp;
          ({Math.round(aciertos * 100 / intentos)}% aciertos).
        </span>}
      </div>
      <footer>
        <p>Idea original: Javier López JAB</p>
      </footer>
    </>
  )
}

export default App
