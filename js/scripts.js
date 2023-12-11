/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET  
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/consultas';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      data.consultas.forEach(item => insertList(item.nome, item.celular, item.gasto_atual, item.gasto_simulado, item.percentual_economia, item.id_operadora))
    })
    .catch((error) => {
      console.error('Error:', error);
    });

}

/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (nome, celular, gasto_atual, id_operadora) => {


  celular = formatCelNumeros(celular)

  //Formatar Gasto Atual
  //R$ 1.234,55
  gasto_atual = gasto_atual.replace("R$ ", "");
  gasto_atual = gasto_atual.replace(".", "");
  gasto_atual = gasto_atual.replace(".", "");
  gasto_atual = gasto_atual.replace(",", ".");


  const formData = new FormData();
  formData.append('nome', nome);
  formData.append('celular', celular);
  formData.append('gasto_atual', gasto_atual);
  formData.append('id_operadora', id_operadora);


  let url = 'http://127.0.0.1:5000/consulta';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {


      let resultado = document.getElementById("resultado");
      //Monta div de Resultado
      let txt = '<h5 class="white">Resultado</h5><span class="white">Gasto atual: </span><h5 class="section-title white">' + formatCurrency(data.gasto_atual, 'BRL', 'pt-BR');
      txt += '</h5><span class="white">Gasto simulado: </span><h5 class="section-title white">' + formatCurrency(data.gasto_simulado, 'BRL', 'pt-BR');
      txt += '</h5><span class="white">Economia: </span><h5 class="section-title white">' + formatCurrency((data.gasto_atual - data.gasto_simulado), 'BRL', 'pt-BR');
      txt += '</h5><span class="white">Percent. Economia: </span><h5 class="section-title white">' + data.percentual_economia + '% </h5> <span class="white">* Valores apresentados podem sofrer alterações.</span>';
      resultado.innerHTML = txt;

      insertList(data.nome, data.celular, data.gasto_atual, data.gasto_simulado, data.percentual_economia, data.id_operadora)

    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  // var table = document.getElementById('myTable');
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const celItem = div.getElementsByTagName('td')[1].innerHTML
      if (confirm("Você tem certeza?")) {
        div.remove()
        deleteItem(celItem)
        alert("Removido!")
      }
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item) => {
  //formata celular
  item = formatCelNumeros(item);
  //console.log(item)
  let url = 'http://127.0.0.1:5000/consulta?celular=' + item;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome, quantidade e valor 
  --------------------------------------------------------------------------------------
*/
const newItem = () => {

  let nome = document.getElementById("newNome").value;
  let celular = document.getElementById("newCelular").value;
  let gasto_atual = document.getElementById("newGasto").value;
  let id_regiao = document.getElementById("regioes-select").value;
  let id_operadora = document.getElementById("operadora-select").value;

  if (nome === '') {
    alert("Informe o nome!");
  } else if (isNaN(id_operadora) || isNaN(id_regiao)) {
    alert("Regiao e Operadora precisam ser informados!");
  } else if (celular.length < 15) {
    alert("Celular inválido!");

  } else {

    postItem(nome, celular, gasto_atual, id_operadora)
    alert("Item adicionado!")
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (nome, celular, gasto_atual, gasto_simulado, percentual_economia, id_operadora) => {


  var item = [nome, formatCel(celular), formatCurrency(gasto_atual, 'BRL', 'pt-BR'), formatCurrency(gasto_simulado, 'BRL', 'pt-BR'), percentual_economia + "%", id_operadora]
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButton(row.insertCell(-1))
  document.getElementById("newNome").value = "";
  document.getElementById("newCelular").value = "";
  document.getElementById("newGasto").value = "";



  removeElement()
}

/*
--------------------------------------------------------------------------------------
  Função para obter a lista de REGIÕES do servidor via requisição GET
--------------------------------------------------------------------------------------
*/
const getRegiao = async () => {
  let url = 'http://127.0.0.1:5000/regioes';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      selectRegiao(data);

    })
    .catch((error) => {
      console.error('Error:', error);
    });

}


/*
  --------------------------------------------------------------------------------------
  Função para popular a combobox de Região
  --------------------------------------------------------------------------------------
*/
const selectRegiao = (data) => {
  const regioesSelect = document.getElementById("regioes-select");

  data.regioes.forEach((item) => {
    option = new Option(item.nome, item.id);
    regioesSelect.options[regioesSelect.options.length] = option;
  });

  getOperadoras(regioesSelect.value)


}

/*
--------------------------------------------------------------------------------------
  Função para obter a lista de Operadoras de uma região do servidor via requisição GET
--------------------------------------------------------------------------------------
*/
const getOperadoras = async (item) => {

  let url = 'http://127.0.0.1:5000/operadora_regiao?id_regiao=' + item;

  fetch(url, {
    method: 'get',
  })

    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      selectOperadora(data);


    })
    .catch((error) => {
      console.error('Error:', error);
    });



}



/*
  --------------------------------------------------------------------------------------
  Função para popular a combobox de Operadora
  --------------------------------------------------------------------------------------
*/
const selectOperadora = (data) => {

  let operadoraSelect = document.getElementById("operadora-select");
  operadoraSelect.options.length = 0;

  data.operadoras.forEach((item) => {

    option = new Option(item.nome, item.id);

    operadoraSelect.options[operadoraSelect.options.length] = option;
  });



}





/*
  --------------------------------------------------------------------------------------
  Função para pegar a REGIÃO selecionada e popular a combobox de Operadora
  --------------------------------------------------------------------------------------
*/

let items = document.getElementById('regioes-select');
items.addEventListener('change', function () {

  getOperadoras(this.value)



});


/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList()


/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento das Regiões
  --------------------------------------------------------------------------------------
*/
getRegiao()


/*
  --------------------------------------------------------------------------------------
 Função para máscara do campo Celular
  --------------------------------------------------------------------------------------
*/
const handlePhone = (event) => {
  let input = event.target
  input.value = phoneMask(input.value)
}

const phoneMask = (value) => {
  if (!value) return ""
  value = value.replace(/\D/g, '')
  value = value.replace(/(\d{2})(\d)/, "($1) $2")
  value = value.replace(/(\d)(\d{4})$/, "$1-$2")
  return value
}



/*
  --------------------------------------------------------------------------------------
 Função para formatação do campo valor
  --------------------------------------------------------------------------------------
*/
String.prototype.reverse = function () {
  return this.split('').reverse().join('');
};

function mascaraMoeda(campo, evento) {
  var tecla = (!evento) ? window.event.keyCode : evento.which;
  var valor = campo.value.replace(/[^\d]+/gi, '').reverse();
  var resultado = "";
  var mascara = "##.###.###,##".reverse();
  for (var x = 0, y = 0; x < mascara.length && y < valor.length;) {
    if (mascara.charAt(x) != '#') {
      resultado += mascara.charAt(x);
      x++;
    } else {
      resultado += valor.charAt(y);
      y++;
      x++;
    }
  }
  campo.value = resultado.reverse();
}

/*
  --------------------------------------------------------------------------------------
 Função para máscara do campo valor
  --------------------------------------------------------------------------------------
*/
const input = document.getElementById("newGasto");
input.addEventListener("keyup", formatarMoeda);
function formatarMoeda(e) {
  var v = e.target.value.replace(/\D/g, "");
  v = (v / 100).toFixed(2) + "";
  v = v.replace(".", ",");
  v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
  v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
  e.target.value = "R$ " + v;

}

/*
  --------------------------------------------------------------------------------------
 Função para formatação do campo de moeda
  --------------------------------------------------------------------------------------
*/
const formatCurrency = (value, currency, localeString) => {
  const options = { style: "currency", currency }
  return value.toLocaleString(localeString, options)
}


/*
  --------------------------------------------------------------------------------------
 Função para formatação de Celular 21555553456 => (21) 55555-3456
  --------------------------------------------------------------------------------------
*/
const formatCel = (value) => {
  //const phoneNumber = "93991384250" // <-- nº de celular não formatado
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  value = value.replace(/(-\d{4})\d+?$/, '$1');
  return value
}

/*
  --------------------------------------------------------------------------------------
 Função para formatação de Celular (21) 55555-3456 => 21555553456
  --------------------------------------------------------------------------------------
*/
const formatCelNumeros = (value) => {
  //Formatar celular
  value = value.replace(" ", "");
  value = value.replace("(", "");
  value = value.replace(")", "");
  value = value.replace("-", "");
  return value
}
