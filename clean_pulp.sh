pulp ansible remote destroy --name $1-$2
pulp ansible distribution destroy --name "$2"
pulp ansible repository destroy --name $1-$2