const { readFile } = require('fs/promises');
class ChatwootClass {

    config = {
        account: undefined,
        token: undefined,
        endpoint: undefined
    }

    /**
     * Recibir todos los parametro de configuracio de conexion con chatwoot
     */
    constructor(_config = {}) {

        if (!_config?.account) {
            throw new Error('ACCOUNT_ERROR')
        }

        if (!_config?.token) {
            throw new Error(`TOKEN_ERROR`)
        }

        if (!_config?.endpoint) {
            throw new Error(`ENDPOINT_ERROR`)
        }

        this.config = _config

    }

    /**
     * [utility]
     * Formateo del formato del numero +34 34
     * @param {*} number 
     * @returns 
     */
    formatNumber = (number) => {
        if (!number.startsWith("+")) {
            return `+${number}`
        }
        return number
    }

    /**
     * [utility]
     * Esta funciona nos ayuda a crear un encabezado con la authorization del token
     * @returns 
     */
    buildHeader = () => {
        const headers = new Headers()
        headers.append('api_access_token', this.config.token)
        headers.append('Content-Type', 'application/json')
        return headers
    }

    /**
     * [utility]
     * Esto nos ayuda a construir un url base 
     * @param {*} path 
     * @returns 
     */
    buildBaseUrl = (path) => {
        console.log(path);
        return `${this.config.endpoint}/api/v1/accounts/${this.config.account}${path}`
    }

    /**
     * [CONTACT]
     * https://www.chatwoot.com/developers/api/#tag/Contacts/operation/contactSearch
     * https://chatwoot-production-e265.up.railway.app/api/v1/accounts/1/contacts/search?q=+359987499
     * @param {*} from numero de telefono 
     * @returns [] array
     */
    findContact = async (from) => {
        try {
            const url = this.buildBaseUrl(`/contacts/search?q=${from}`)

            const dataFetch = await fetch(url, {
                headers: this.buildHeader(),
                method: 'GET'
            })

            const data = await dataFetch.json()
            return data.payload[0]

        } catch (error) {
            console.error(`[Error searchByNumber]`, error)
            return []
        }
    }

    /**
     * [CONTACT]
     *  Crear un contacto
     * @param {*} dataIn 
     * @returns 
     */
    createContact = async (dataIn = { from: '', name: '', inbox: '' }) => {
        try {

            dataIn.from = this.formatNumber(dataIn.from)

            const data = {
                inbox_id: dataIn.inbox,
                name: dataIn.name,
                phone_number: dataIn.from,
            };

            const url = this.buildBaseUrl(`/contacts`)

            const dataFetch = await fetch(url, {
                headers: this.buildHeader(),
                method: 'POST',
                body: JSON.stringify(data)
            })

            const response = await dataFetch.json()
            return response.payload.contact

        } catch (error) {
            console.error(`[Error createContact]`, error)
            return
        }
    }

    /** 
     * [CONTACT]
     * Buscar o crear contacto
     * @param {*} dataIn 
     * @returns 
     */

    findOrCreateContact = async (dataIn = { from: '', name: '', inbox: '' }) => {
        try {
            dataIn.from = this.formatNumber(dataIn.from)
            const getContact = await this.findContact(dataIn.from)
            if (!getContact) {
                const contact = await this.createContact(dataIn)
                return contact
            }
            return getContact

        } catch (error) {
            console.error(`[Error findOrCreateContact]`, error)
            return
        }
    }


    /**
     * [CONVERSATION]
     * Importante crear este atributo personalizado en el chatwoot
     * Crear conversacion
     * @param {*} dataIn 
     * @returns 
     */
    createConversation = async (dataIn = { inbox_id: '', contact_id: '', phone_number: '' }) => {
        try {

            dataIn.phone_number = this.formatNumber(dataIn.phone_number)

            const payload = {
                custom_attributes: { phone_number: dataIn.phone_number },
            };

            const url = this.buildBaseUrl(`/conversations`)
            const dataFetch = await fetch(url,
                {
                    method: "POST",
                    headers: this.buildHeader(),
                    body: JSON.stringify({ ...dataIn, ...payload }),
                }
            );
            const data = await dataFetch.json();
            return data
        } catch (error) {
            console.error(`[Error createConversation]`, error)
            return
        }
    }

    /**
     * [CONVERSATION]
     * Buscar si existe una conversacion previa
     * @param {*} dataIn 
     * @returns 
     */

findConversation = async (dataIn = { phone_number: '' }) => {
    console.log('findConversation called with data:', dataIn);
    try {
        // Asegurando que el número de teléfono está en el formato correcto
        // Por ejemplo, si necesitas remover el signo '+' del inicio, puedes descomentar la siguiente línea
        // dataIn.phone_number = dataIn.phone_number.replace(/^\+/, '');

        console.log('Preparando payload con el número de teléfono:', dataIn.phone_number);
	
/*
    	const payload = {
			attribute_key: "status",
			attribute_model: "standard",
			filter_operator: "not_equal_to",
			values: ["resolved", "pending", "snoozed"],
			custom_attribute_type: ""
		};
*/	
	



        const url = this.buildBaseUrl(`/conversations/filter`);
        console.log('URL construida para la petición:', url);

        console.log('Realizando petición a la API...');
		
        const dataFetch = await fetch(url,
            {
                method: "POST",
                headers: this.buildHeader(),
				  body: JSON.stringify({
					'payload': [
					  {
						"attribute_key": "status",
						"attribute_model": "standard",
						"filter_operator": "equal_to",
						"values": [
						  "open"
						],
						"query_operator": "and",
						"custom_attribute_type": ""
					  },
					  {
						"attribute_key": "inbox_id",
						"attribute_model": "standard",
						"filter_operator": "equal_to",
						"values": [
						  "2"
						],
						"query_operator": "and",
						"custom_attribute_type": ""
					  },
					  {
						"attribute_key": "phone_number",
						"filter_operator": "equal_to",
					     "values": [dataIn.phone_number],
						"attribute_model": "standard",
						"custom_attribute_type": ""
					  }
					]
				  })
            }
        );
		
		
		/*
		const dataFetch = await fetch(url, {
		  method: 'POST',
		  headers: {
			'Accept': 'application/json, text/plain',
			'Content-Type': 'application/json',
			'api_access_token': 'Yx32PEgp5k1yqf3YTauqJP7L'
		  },
		  body: JSON.stringify({
			'payload': [
			  {
				'attribute_key': 'status',
				'attribute_model': 'standard',
				'filter_operator': 'equal_to',
				'values': [
				  'open'
				],
				'query_operator': 'and',
				'custom_attribute_type': ''
			  },
			  {
				'attribute_key': 'inbox_id',
				'attribute_model': 'standard',
				'filter_operator': 'equal_to',
				'values': [
				  '4'
				],
				'custom_attribute_type': ''
			  }
			]
		  })
		});
*/
		
		
		
		console.log('cabeza:');
		console.log(this.buildHeader());
		
        //console.log('Respuesta recibida de la petición fetch:', dataFetch);
        
        if (!dataFetch.ok) {
            console.error('La petición fetch falló con el estado:', dataFetch.status);
        }

        console.log('Headers usados en la petición:', this.buildHeader());
       // console.log('Cuerpo de la petición:', JSON.stringify({ payload }));

        const data = await dataFetch.json();
        console.log('Datos recibidos y convertidos a JSON:', data);

        if (data.payload) {
            console.log('Payload recibido:', data.payload);
        } else {
            console.log('No se recibió payload en la respuesta.');
        }

        return data.payload;
    } catch (error) {
        console.error(`[Error findConversation]`, error);
        // Propagando el error para manejo externo
        throw error;
    }
}


    /**
     * [CONVERSATION]
     * Buscar o Crear conversacion
     * @param {*} dataIn 
     * @returns 
     */
// Definición de la función asíncrona `findOrCreateConversation` para buscar o crear una conversación.
    findOrCreateConversation = async (dataIn = { inbox_id: '', contact_id: '', phone_number: '' }) => {
        try {
            console.log('Iniciando findOrCreateConversation con dataIn:', dataIn);

            // Formatea el número de teléfono antes de continuar.
            console.log('Formateando el número de teléfono:', dataIn.phone_number);
            dataIn.phone_number = this.formatNumber(dataIn.phone_number);
            console.log('Número de teléfono formateado:', dataIn.phone_number);

            // Busca una conversación existente con los datos proporcionados.
            console.log('Buscando conversación existente con:', dataIn);
            const getId = await this.findConversation(dataIn);
            console.log('Resultado de la búsqueda:', getId);

            // Verifica si la búsqueda no retornó resultados o getId es undefined.
            if (!getId || !getId.length) {
                console.log('No se encontró una conversación existente. Creando una nueva conversación.');

                // Crea una nueva conversación si no se encontró una existente.
                const conversationId = await this.createConversation(dataIn);
                console.log('Conversación creada con ID:', conversationId);

                return conversationId;
            } else {
                // Retorna el ID de la conversación encontrada.
                console.log('Conversaión existente encontrada, ID:', getId[0]);
                return getId[0];
            }

        } catch (error) {
            // Captura y registra cualquier error que ocurra durante el proceso.
            console.error('[Error findOrCreateConversation]', error);
            return;
        }
    };


    /**
     * Esta funcion ha sido modificada para poder enviar archivos multimedia y texto
     * [messages]
     * @param {mode}  "incoming" | "outgoing"
     * @param {*} dataIn 
     * @returns 
     */
    createMessage = async (dataIn = { msg: '', mode: '', conversation_id: '', attachment: [] }) => {
        try {
            const url = this.buildBaseUrl(`/conversations/${dataIn.conversation_id}/messages`)
            const form = new FormData();
          
            form.set("content", dataIn.msg);
            form.set("message_type", dataIn.mode);
            form.set("private", "true");

            if(dataIn.attachment?.length){
                const fileName  = `${dataIn.attachment[0]}`.split('/').pop()
                const blob = new Blob([await readFile(dataIn.attachment[0])]);
                form.set("attachments[]", blob, fileName);
            }
            const dataFetch = await fetch(url,
                {
                    method: "POST",
                    headers: {
                        api_access_token:this.config.token
                    },
                    body: form
                }
            );
            const data = await dataFetch.json();
            return data
        } catch (error) {
            console.error(`[Error createMessage]`, error)
            return
        }
    }

    /**
     * [inboxes]
     * Crear un inbox si no existe
     * @param {*} dataIn 
     * @returns 
     */

    createInbox = async (dataIn = { name: '' }) => {
        try {
            const payload = {
                name: dataIn.name,
                channel: {
                    type: "api",
                    webhook_url: "",
                },
            };

            const url = this.buildBaseUrl(`/inboxes`)
            console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');
            console.log(url);
            const dataFetch = await fetch(url, {
                headers: this.buildHeader(),
                method: 'POST',
                body: JSON.stringify(payload)
            })

            const data = await dataFetch.json();
            return data;

        } catch (error) {
            console.error(`[Error createInbox]`, error)
            return
        }
    }

    /**
     * [inboxes]
     * Buscar si existe un inbox creado
     * @param {*} dataIn 
     * @returns 
     */
// Definición de la función asíncrona `findInbox` para buscar un buzón por nombre.
// `dataIn` es un objeto con una propiedad `name`, que por defecto es una cadena vacía.

    findInbox = async (dataIn = { name: '' }) => {
        try {

            const url = this.buildBaseUrl(`/inboxes`)
            const dataFetch = await fetch(url, {
                headers: this.buildHeader(),
                method: 'GET',
            })

            const data = await dataFetch.json();
            const payload = data.payload

            const checkIfExist = payload.find((o) => o.name === dataIn.name)

            if (!checkIfExist) {
                return
            }

            return checkIfExist;
        } catch (error) {
            console.error(`[Error findInbox]`, error)
            return
        }
    }



    /**
     * [inboxes]
     * Buscar o crear inbox
     * @param {*} dataIn 
     * @returns 
     */
    findOrCreateInbox = async (dataIn = { name: '' }) => {
        try {
            const getInbox = await this.findInbox(dataIn)
            if (!getInbox) {
                const idInbox = await this.createInbox(dataIn)
                return idInbox
            }
            return getInbox

        } catch (error) {
            console.error(`[Error findOrCreateInbox]`, error)
            return
        }
    }

}


module.exports = ChatwootClass
